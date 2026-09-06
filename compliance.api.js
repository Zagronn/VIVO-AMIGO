const crypto = require('node:crypto');
const express = require('express');
const { createIronShieldProtocol, createThreatGuard } = require('./services/ironShieldProtocol');

const PRODUCTION_ORIGINS = {
  ecosystem: 'https://vivoamigo.com',
  pay: 'https://payvivoamigo.com',
  cargo: 'https://cargovivo.com'
};

function allowedOrigins() {
  const configured = process.env.VIVO_ALLOWED_ORIGINS || [
    process.env.VIVO_ECOSYSTEM_ORIGIN || PRODUCTION_ORIGINS.ecosystem,
    process.env.PAY_VIVO_ORIGIN || PRODUCTION_ORIGINS.pay,
    process.env.CARGO_VIVO_ORIGIN || PRODUCTION_ORIGINS.cargo,
    'http://localhost:3001',
    'http://localhost:3002'
  ].join(',');
  return new Set(configured.split(',').map((origin) => origin.trim()).filter(Boolean));
}

function corsWhitelist(request, response, next) {
  const origin = request.get('Origin');
  const origins = allowedOrigins();
  if (origin && !origins.has(origin)) return response.status(403).json({ error: 'origin is not allowed' });
  if (origin) {
    response.set('Access-Control-Allow-Origin', origin);
    response.set('Access-Control-Allow-Credentials', 'true');
    response.set('Vary', 'Origin');
  }
  if (request.method === 'OPTIONS') {
    response.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response.sendStatus(204);
  }
  return next();
}

function requiredString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    const error = new Error(`${field} is required`);
    error.statusCode = 400;
    throw error;
  }
  return value.trim();
}

function unavailableAdapter(name) {
  return async () => {
    const error = new Error(`${name} adapter is not configured`);
    error.statusCode = 503;
    throw error;
  };
}

function amount(value) {
  if (!Number.isFinite(value) || value <= 0) {
    const error = new Error('amount must be greater than zero');
    error.statusCode = 400;
    throw error;
  }
  return Number(value.toFixed(2));
}

function createComplianceApp({
  verifyRenap = unavailableAdapter('RENAP'),
  verifySat = unavailableAdapter('SAT'),
  wallets = new Map(),
  walletTransactions = new Map(),
  shipments = new Map(),
  ironShield = createIronShieldProtocol({ encryptionKey: process.env.VIVO_VAULT_KEY || 'local-development-vault-key-32-bytes!!' }),
  onThreat = () => {}
} = {}) {
  const app = express();
  app.use(corsWhitelist);
  app.use(express.json({ limit: '32kb' }));
  app.use(createThreatGuard({ onThreat: (threat) => { ironShield.alerts.push(threat); onThreat(threat); } }));

  app.get('/health', (_request, response) => response.json({ service: 'veri-shield', status: 'ok' }));

  app.get('/v1/security/management/alerts', (_request, response) => response.json({ alerts: ironShield.getManagementAlerts() }));
  app.get('/v1/security/status', (_request, response) => response.json(ironShield.getSystemSecurityStatus()));

  app.post('/v1/security/emergency-lock', (request, response, next) => {
    try {
      response.json(ironShield.triggerEmergencyLock(request.body?.triggeredBy));
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  });

  app.post('/v1/compliance/renap/verify', async (request, response, next) => {
    try {
      const nationalId = requiredString(request.body?.nationalId, 'nationalId');
      const result = await verifyRenap({ nationalId, fullName: request.body?.fullName });
      response.json({ provider: 'RENAP', verified: Boolean(result.verified), reference: result.reference ?? null });
    } catch (error) {
      next(error);
    }
  });

  app.post('/v1/compliance/identity/register', (request, response, next) => {
    try {
      response.status(201).json(ironShield.registerIdentity(request.body || {}));
    } catch (error) {
      error.statusCode = error.statusCode || 409;
      next(error);
    }
  });

  app.post('/v1/check/otp/issue', (request, response, next) => {
    try {
      response.status(201).json(ironShield.issueOtp(request.body || {}));
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  });

  app.post('/v1/check/otp/verify', (request, response, next) => {
    try {
      response.json(ironShield.verifyOtp(request.body || {}));
    } catch (error) {
      error.statusCode = 403;
      next(error);
    }
  });

  app.post('/v1/compliance/sat/verify', async (request, response, next) => {
    try {
      const taxId = requiredString(request.body?.taxId, 'taxId');
      const result = await verifySat({ taxId, legalName: request.body?.legalName });
      response.json({ provider: 'SAT', verified: Boolean(result.verified), reference: result.reference ?? null });
    } catch (error) {
      next(error);
    }
  });

  app.post('/v1/pay/wallets', (request, response, next) => {
    try {
      const userId = requiredString(request.body?.userId, 'userId');
      const wallet = { id: crypto.randomUUID(), userId, currency: request.body?.currency || 'GTQ', availableBalance: 0, heldBalance: 0 };
      wallets.set(wallet.id, wallet);
      response.status(201).json(wallet);
    } catch (error) {
      next(error);
    }
  });

  app.post('/v1/pay/wallets/:walletId/hold', (request, response, next) => {
    try {
      const wallet = wallets.get(request.params.walletId);
      if (!wallet) throw Object.assign(new Error('wallet not found'), { statusCode: 404 });
      const transactionKey = requiredString(request.body?.idempotencyKey, 'idempotencyKey');
      const existing = walletTransactions.get(transactionKey);
      if (existing) return response.json(existing);
      const holdAmount = amount(request.body?.amount);
      const risk = ironShield.evaluateTransaction({ accountId: wallet.userId, amount: holdAmount });
      if (!risk.allowed) throw Object.assign(new Error(risk.reason), { statusCode: 423, risk });
      if (wallet.availableBalance < holdAmount) throw Object.assign(new Error('insufficient available balance'), { statusCode: 409 });
      wallet.availableBalance -= holdAmount;
      wallet.heldBalance += holdAmount;
      const transaction = { id: crypto.randomUUID(), type: 'hold', amount: holdAmount, walletId: wallet.id, status: 'held' };
      walletTransactions.set(transactionKey, transaction);
      response.status(201).json({ transaction, wallet });
    } catch (error) {
      next(error);
    }
  });

  app.post('/v1/pay/wallets/:walletId/release', (request, response, next) => {
    try {
      const wallet = wallets.get(request.params.walletId);
      if (!wallet) throw Object.assign(new Error('wallet not found'), { statusCode: 404 });
      const transactionKey = requiredString(request.body?.idempotencyKey, 'idempotencyKey');
      const existing = walletTransactions.get(transactionKey);
      if (existing) return response.json(existing);
      const releaseAmount = amount(request.body?.amount);
      if (wallet.heldBalance < releaseAmount) throw Object.assign(new Error('insufficient held balance'), { statusCode: 409 });
      wallet.heldBalance -= releaseAmount;
      wallet.availableBalance += releaseAmount;
      const transaction = { id: crypto.randomUUID(), type: 'release', amount: releaseAmount, walletId: wallet.id, status: 'released' };
      walletTransactions.set(transactionKey, transaction);
      response.status(201).json({ transaction, wallet });
    } catch (error) {
      next(error);
    }
  });

  app.post('/v1/cargo/shipments', (request, response, next) => {
    try {
      const senderId = requiredString(request.body?.senderId, 'senderId');
      if (!request.body?.origin || !request.body?.destination) throw Object.assign(new Error('origin and destination are required'), { statusCode: 400 });
      const trackingCode = `VIVO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const shipment = { trackingCode, senderId, recipientId: request.body.recipientId || null, origin: request.body.origin, destination: request.body.destination, status: 'created', history: [{ status: 'created', at: new Date().toISOString() }] };
      shipments.set(trackingCode, shipment);
      response.status(201).json(shipment);
    } catch (error) {
      next(error);
    }
  });

  app.get('/v1/cargo/shipments/:trackingCode', (request, response, next) => {
    try {
      const shipment = shipments.get(request.params.trackingCode);
      if (!shipment) throw Object.assign(new Error('shipment not found'), { statusCode: 404 });
      response.json(shipment);
    } catch (error) {
      next(error);
    }
  });

  app.post('/v1/cargo/shipments/:trackingCode/status', (request, response, next) => {
    try {
      const shipment = shipments.get(request.params.trackingCode);
      if (!shipment) throw Object.assign(new Error('shipment not found'), { statusCode: 404 });
      const nextStatus = requiredString(request.body?.status, 'status');
      const transitions = { created: ['in_transit', 'cancelled'], in_transit: ['delivered', 'cancelled'], delivered: [], cancelled: [] };
      if (!transitions[shipment.status]?.includes(nextStatus)) throw Object.assign(new Error(`invalid shipment transition: ${shipment.status} to ${nextStatus}`), { statusCode: 409 });
      shipment.status = nextStatus;
      shipment.history.push({ status: nextStatus, at: new Date().toISOString() });
      response.json(shipment);
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _request, response, _next) => {
    response.status(error.statusCode || 502).json({ error: error.message || 'VERI-SHIELD request failed' });
  });
  return app;
}

module.exports = { PRODUCTION_ORIGINS, createComplianceApp };

if (require.main === module) {
  createComplianceApp().listen(process.env.PORT || 3001, () => {
    console.log('VERI-SHIELD compliance API listening');
  });
}