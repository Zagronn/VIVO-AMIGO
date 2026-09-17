const crypto = require('node:crypto');

const OTP_TTL_MS = 120_000;
const ANOMALY_MULTIPLIER = 10;
const SQLI_PATTERN = /(?:union\s+select|sleep\s*\(|benchmark\s*\(|drop\s+table|or\s+1\s*=\s*1|--\s*$)/i;

let securityState = {
  isEmergencyLockActive: false,
  activeThreatLevel: 'NORMAL',
  totalBlockedAttempts: 14,
  vaultStatus: 'ENCRYPTED_SECURE'
};

function required(value, field) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${field} is required`);
  return value.trim();
}

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function timingSafeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function distanceMeters(left, right) {
  const earthRadius = 6_371_000;
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const latitudeDelta = toRadians(right.latitude - left.latitude);
  const longitudeDelta = toRadians(right.longitude - left.longitude);
  const latitude = toRadians(left.latitude);
  const otherLatitude = toRadians(right.latitude);
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(latitude) * Math.cos(otherLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function validCoordinates(coordinates, field) {
  if (!coordinates || !Number.isFinite(coordinates.latitude) || !Number.isFinite(coordinates.longitude)) throw new Error(`${field} coordinates are required`);
  if (Math.abs(coordinates.latitude) > 90 || Math.abs(coordinates.longitude) > 180) throw new Error(`${field} coordinates are invalid`);
}

class IsolatedVault {
  constructor({ encryptionKey = process.env.VIVO_VAULT_KEY } = {}) {
    if (!encryptionKey || Buffer.byteLength(encryptionKey) < 32) throw new Error('VIVO_VAULT_KEY must be at least 32 bytes');
    this.key = crypto.createHash('sha256').update(encryptionKey).digest();
    this.records = new Map();
  }

  put(subjectId, value, type) {
    required(subjectId, 'subjectId');
    required(type, 'type');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
    this.records.set(`${type}:${subjectId}`, { iv: iv.toString('base64'), ciphertext: ciphertext.toString('base64'), tag: cipher.getAuthTag().toString('base64') });
    return { vaultReference: `VAULT-${crypto.randomUUID()}`, subjectId, type };
  }

  has(subjectId, type) {
    return this.records.has(`${type}:${subjectId}`);
  }
}

class IronShieldProtocol {
  constructor({ vault, now = () => Date.now(), onAlert = () => {} } = {}) {
    this.vault = vault;
    this.now = now;
    this.onAlert = onAlert;
    this.securityState = { ...securityState };
    this.identities = new Map();
    this.otpChallenges = new Map();
    this.baselines = new Map();
    this.frozenAccounts = new Set();
    this.alerts = [];
  }

  getSystemSecurityStatus() {
    return { ...this.securityState };
  }

  triggerEmergencyLock(triggeredBy) {
    required(triggeredBy, 'triggeredBy');
    this.securityState = { ...this.securityState, isEmergencyLockActive: true, activeThreatLevel: 'CRITICAL_ATTACK', vaultStatus: 'ISOLATED' };
    const alert = { type: 'EMERGENCY_LOCK', triggeredBy, createdAt: new Date(this.now()).toISOString(), action: 'ESCROW_AND_OTP_PAUSED' };
    this.alerts.push(alert);
    this.onAlert(alert);
    return this.getSystemSecurityStatus();
  }

  registerIdentity({ userId, nationalId, renapVerified, livenessVerified, biometricTemplate }) {
    required(userId, 'userId');
    required(nationalId, 'nationalId');
    if (renapVerified !== true || livenessVerified !== true || !biometricTemplate) throw new Error('RENAP and liveness verification are required');
    const identityKey = digest(nationalId);
    const existing = this.identities.get(identityKey);
    if (existing && existing.userId !== userId) throw new Error('duplicate identity blocked');
    this.vault.put(userId, { biometricTemplate: digest(biometricTemplate), identityKey }, 'renap-biometric');
    this.identities.set(identityKey, { userId, identityKey });
    return { userId, identityKey, status: 'IDENTITY_LINKED' };
  }

  issueOtp({ challengeId = crypto.randomUUID(), buyer, seller, code, issuedAt = this.now() }) {
    if (this.securityState.isEmergencyLockActive) throw new Error('emergency lock active: OTP checks paused');
    validCoordinates(buyer, 'buyer');
    validCoordinates(seller, 'seller');
    if (distanceMeters(buyer, seller) > 100) throw new Error('buyer and seller coordinates do not match');
    if (!/^\d{4}$/.test(String(code))) throw new Error('OTP code must be exactly four digits');
    this.otpChallenges.set(challengeId, { codeHash: digest(String(code)), buyer, seller, issuedAt });
    return { challengeId, expiresAt: issuedAt + OTP_TTL_MS };
  }

  verifyOtp({ challengeId, code, buyer, seller, verifiedAt = this.now() }) {
    if (this.securityState.isEmergencyLockActive) throw new Error('emergency lock active: OTP checks paused');
    const challenge = this.otpChallenges.get(required(challengeId, 'challengeId'));
    if (!challenge || verifiedAt - challenge.issuedAt > OTP_TTL_MS || verifiedAt < challenge.issuedAt) throw new Error('OTP expired or not found');
    validCoordinates(buyer, 'buyer');
    validCoordinates(seller, 'seller');
    if (distanceMeters(challenge.buyer, buyer) > 100 || distanceMeters(challenge.seller, seller) > 100 || distanceMeters(buyer, seller) > 100) throw new Error('GPS coordinates do not match');
    if (!timingSafeEqual(challenge.codeHash, digest(String(code)))) throw new Error('invalid OTP');
    this.otpChallenges.delete(challengeId);
    return { verified: true, verifiedAt };
  }

  evaluateTransaction({ accountId, amount }) {
    required(accountId, 'accountId');
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('amount must be greater than zero');
    if (this.securityState.isEmergencyLockActive) return { allowed: false, frozen: true, reason: 'emergency lock active: escrow transfers paused' };
    if (this.frozenAccounts.has(accountId)) return { allowed: false, frozen: true, reason: 'account frozen' };
    const amounts = this.baselines.get(accountId) || [];
    const baseline = amounts.length ? amounts.reduce((sum, value) => sum + value, 0) / amounts.length : 0;
    const anomalous = baseline > 0 && amount > baseline * ANOMALY_MULTIPLIER;
    if (anomalous) {
      this.frozenAccounts.add(accountId);
      this.securityState = { ...this.securityState, activeThreatLevel: 'ELEVATED_RISK', totalBlockedAttempts: this.securityState.totalBlockedAttempts + 1 };
      const alert = { type: 'TRANSACTION_ANOMALY', accountId, amount, baseline, createdAt: new Date(this.now()).toISOString(), action: 'ACCOUNT_FROZEN' };
      this.alerts.push(alert);
      this.onAlert(alert);
      return { allowed: false, frozen: true, reason: 'transaction exceeds 10x user baseline', alert };
    }
    amounts.push(amount);
    this.baselines.set(accountId, amounts.slice(-20));
    return { allowed: true, frozen: false, baseline };
  }

  getManagementAlerts() {
    return [...this.alerts];
  }
}

function triggerEmergencyLock(triggeredBy) {
  required(triggeredBy, 'triggeredBy');
  securityState = { ...securityState, isEmergencyLockActive: true, activeThreatLevel: 'CRITICAL_ATTACK', vaultStatus: 'ISOLATED' };
  return { ...securityState };
}

function evaluateTransactionRisk(amountGTQ, userBaselineAvg) {
  if (!Number.isFinite(amountGTQ) || !Number.isFinite(userBaselineAvg) || amountGTQ <= 0 || userBaselineAvg < 0) throw new Error('transaction amount and baseline must be valid numbers');
  const highRisk = amountGTQ > userBaselineAvg * ANOMALY_MULTIPLIER && amountGTQ > 50_000;
  if (highRisk) securityState = { ...securityState, activeThreatLevel: 'ELEVATED_RISK', totalBlockedAttempts: securityState.totalBlockedAttempts + 1 };
  return highRisk;
}

function createThreatGuard({ windowMs = 60_000, maxRequests = 120, onThreat = () => {}, sandboxIsolate = () => {}, hotfixDeploy = () => {} } = {}) {
  const requests = new Map();
  return (request, response, next) => {
    const now = Date.now();
    const address = request.ip || request.socket?.remoteAddress || 'unknown';
    const history = (requests.get(address) || []).filter((timestamp) => now - timestamp < windowMs);
    history.push(now);
    requests.set(address, history);
    const payload = JSON.stringify({ url: request.originalUrl, query: request.query, body: request.body });
    const sqlInjection = SQLI_PATTERN.test(payload);
    const ddos = history.length > maxRequests;
    if (sqlInjection || ddos) {
      const threat = { type: sqlInjection ? 'SQLI' : 'DDOS_BURST', address, createdAt: new Date(now).toISOString(), action: 'SANDBOX_ISOLATION_AND_HOTFIX' };
      sandboxIsolate(threat);
      hotfixDeploy(threat);
      onThreat(threat);
      return response.status(429).json({ error: 'request blocked by Iron Shield', threat: threat.type });
    }
    return next();
  };
}

function createIronShieldProtocol(options = {}) {
  return new IronShieldProtocol({ ...options, vault: options.vault || new IsolatedVault({ encryptionKey: options.encryptionKey || process.env.VIVO_VAULT_KEY }) });
}

module.exports = { ANOMALY_MULTIPLIER, OTP_TTL_MS, IsolatedVault, IronShieldProtocol, createIronShieldProtocol, createThreatGuard, distanceMeters, evaluateTransactionRisk, triggerEmergencyLock };