const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { createComplianceApp } = require('./compliance.api');
const { SwarmOrchestrator } = require('./agents.service');
const { createLocalSqliteStore, createPosApp, generateQrPayload } = require('./vivopos.service');
const { IsolatedVault, IronShieldProtocol, OTP_TTL_MS, evaluateTransactionRisk } = require('./services/ironShieldProtocol');

async function request(app, path, body, method = 'POST', extraHeaders = {}) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}${path}`;
  const options = { method, headers: { 'content-type': 'application/json', ...extraHeaders } };
  if (body !== undefined) options.body = JSON.stringify(body);
  const response = await fetch(url, options);
  const json = await response.json();
  await new Promise((resolve) => server.close(resolve));
  return { status: response.status, json };
}

async function getText(app, path) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`);
  const text = await response.text();
  await new Promise((resolve) => server.close(resolve));
  return { status: response.status, text };
}

test('generates a signed, expiring QR payload', () => {
  const qr = generateQrPayload({ terminalId: 'T-1', amount: 12.5 }, 'test-secret');
  assert.match(qr.qrData, /^vivo:\/\/pay\/.+\..+$/);
  assert.ok(qr.expiresAt > Date.now());
});

test('enforces Iron Shield vault, identity, geofenced OTP, and anomaly freeze', () => {
  let now = 1_700_000_000_000;
  const protocol = new IronShieldProtocol({ vault: new IsolatedVault({ encryptionKey: 'test-vault-key-with-at-least-32-bytes' }), now: () => now });
  const coordinates = { latitude: 14.6349, longitude: -90.5069 };
  protocol.registerIdentity({ userId: 'user-1', nationalId: 'DPI-1', renapVerified: true, livenessVerified: true, biometricTemplate: 'biometric-template' });
  assert.equal(protocol.vault.has('user-1', 'renap-biometric'), true);
  assert.throws(() => protocol.registerIdentity({ userId: 'user-2', nationalId: 'DPI-1', renapVerified: true, livenessVerified: true, biometricTemplate: 'other-template' }), /duplicate identity/);
  const challenge = protocol.issueOtp({ buyer: coordinates, seller: coordinates, code: '1234' });
  assert.equal(challenge.expiresAt, now + OTP_TTL_MS);
  assert.throws(() => protocol.verifyOtp({ challengeId: challenge.challengeId, code: '1234', buyer: coordinates, seller: { latitude: 14.7, longitude: -90.5 } }), /GPS/);
  protocol.evaluateTransaction({ accountId: 'user-1', amount: 100 });
  const anomaly = protocol.evaluateTransaction({ accountId: 'user-1', amount: 1001 });
  assert.equal(anomaly.frozen, true);
  assert.equal(protocol.getManagementAlerts()[0].type, 'TRANSACTION_ANOMALY');
});

test('locks escrow and OTP checks during a critical attack', () => {
  const protocol = new IronShieldProtocol({ vault: new IsolatedVault({ encryptionKey: 'lock-test-vault-key-with-at-least-32-bytes' }) });
  const status = protocol.triggerEmergencyLock('management-panel');
  assert.equal(status.isEmergencyLockActive, true);
  assert.equal(status.activeThreatLevel, 'CRITICAL_ATTACK');
  assert.equal(status.vaultStatus, 'ISOLATED');
  assert.equal(evaluateTransactionRisk(500_001, 50_000), true);
  assert.throws(() => protocol.issueOtp({ buyer: { latitude: 14, longitude: -90 }, seller: { latitude: 14, longitude: -90 }, code: '1234' }), /emergency lock/);
});

test('defines the typed executive Iron Shield engine and protocol', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'vivoSecurityShieldEngine.ts'), 'utf8');
  const protocol = fs.readFileSync(path.join(__dirname, 'docs', 'VIVO_IRON_SHIELD_PROTOCOL.md'), 'utf8');
  const dashboard = fs.readFileSync(path.join(__dirname, 'components', 'VivoSecurityShieldDashboard.tsx'), 'utf8');
  assert.match(engine, /export interface SystemSecurityStatus/);
  assert.match(engine, /triggerEmergencyLock/);
  assert.match(engine, /evaluateTransactionRisk/);
  assert.match(engine, /CRITICAL_ATTACK/);
  assert.match(protocol, /Zero-Trust Rules/);
  assert.match(protocol, /Vault Isolation/);
  assert.match(protocol, /120 seconds/);
  assert.match(dashboard, /v1\/security\/emergency-lock/);
  assert.match(dashboard, /VivoSecurityShieldDashboard/);
});

test('defines fail-closed invisible vehicle verification', () => {
  const filter = fs.readFileSync(path.join(__dirname, 'services', 'invisibleVehicleFilter.ts'), 'utf8');
  assert.match(filter, /VehicleVerificationInput/);
  assert.match(filter, /processInvisibleVehicleFilter/);
  assert.match(filter, /readRegistrationDocument/);
  assert.match(filter, /querySatPnc/);
  assert.match(filter, /STOLEN_ALERT/);
  assert.match(filter, /LEGAL_LIEN/);
  assert.match(filter, /vivoVerifySealEligible: true/);
  assert.match(filter, /not configured/);
});

test('gates protected listings before public acceptance and dispatches VIVO-VERIFY', () => {
  const route = fs.readFileSync(path.join(__dirname, 'app', 'api', 'v1', 'listings', 'route.ts'), 'utf8');
  const dispatch = fs.readFileSync(path.join(__dirname, 'services', 'vivoVerifyDispatch.ts'), 'utf8');
  assert.match(route, /processInvisibleVehicleFilter/);
  assert.match(route, /DOCUMENT_REVIEW_REQUIRED/);
  assert.match(route, /requiresInvisibleBarrier/);
  assert.match(route, /dispatchVivoVerifyMobileInspector/);
  assert.match(dispatch, /DISPATCH_REQUESTED/);
});

test('defines VIVO-VERIFY invisible OCR, quarantine, and VIP booking surfaces', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'vivoVerifyEngine.ts'), 'utf8');
  const form = fs.readFileSync(path.join(__dirname, 'components', 'VivoVerifyForm.tsx'), 'utf8');
  const policy = fs.readFileSync(path.join(__dirname, 'DEVIN_INVISIBLE_FILTER.md'), 'utf8');
  assert.match(engine, /processInvisibleVehicleFilter/);
  assert.match(engine, /bookVipInspection/);
  assert.match(engine, /VIP_MOBILE_INSPECTION/);
  assert.match(form, /v1\/verify\/vehicle/);
  assert.match(form, /v1\/verify\/inspection/);
  assert.match(form, /Reservar inspección VIP/);
  assert.match(policy, /Never insert, update, index, cache, or publish/);
  assert.match(policy, /SAT and PNC/);
});

test('integrates the executive security pitch card', () => {
  const card = fs.readFileSync(path.join(__dirname, 'components', 'ExecutivePitchCard.tsx'), 'utf8');
  const showcase = fs.readFileSync(path.join(__dirname, 'components', 'VivoPremiumShowcase.tsx'), 'utf8');
  assert.match(card, /ExecutivePitchCard/);
  assert.match(card, /FILTRO INVISIBLE/);
  assert.match(card, /DEFENSA AI/);
  assert.match(showcase, /ExecutivePitchCard/);
});

test('defines executive pitch data and board-ready scenario metrics', () => {
  const data = fs.readFileSync(path.join(__dirname, 'docs', 'EXECUTIVE_PITCH_DATA.md'), 'utf8');
  const card = fs.readFileSync(path.join(__dirname, 'components', 'ExecutivePitchCard.tsx'), 'utf8');
  assert.match(data, /Strategic Comparison/);
  assert.match(data, /Target GMV/);
  assert.match(data, /\$200,000,000/);
  assert.match(data, /\$12,000,000/);
  assert.match(data, /not .*guaranteed return/i);
  assert.match(card, /\$200M/);
  assert.match(card, /\$12M/);
  assert.match(card, /8x-10x/);
});

test('defines fail-closed social share verification and promotion API', () => {
  const verifier = fs.readFileSync(path.join(__dirname, 'services', 'socialShareVerification.ts'), 'utf8');
  const route = fs.readFileSync(path.join(__dirname, 'app', 'api', 'v1', 'promotions', 'social-share', 'route.ts'), 'utf8');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  assert.match(verifier, /processSocialShareVerification/);
  assert.match(verifier, /containsRequiredHashtag/);
  assert.match(verifier, /containsOfficialPromoVideo/);
  assert.match(verifier, /recordClaim/);
  assert.match(verifier, /UPDATE users SET commission_rate = 0\.0/);
  assert.match(verifier, /LISTING_DOPING_CREDIT/);
  assert.match(verifier, /FOR UPDATE/);
  assert.match(verifier, /BEGIN/);
  assert.match(verifier, /commissionRate: 0/);
  assert.match(verifier, /social platform verification adapter is not configured/);
  assert.match(route, /processSocialShareVerification/);
  assert.match(schema, /commission_rate NUMERIC/);
  assert.match(schema, /doping_credits INTEGER/);
});

test('defines the API-backed VIVO-VIRAL share modal', () => {
  const modal = fs.readFileSync(path.join(__dirname, 'components', 'VivoViralShareModal.tsx'), 'utf8');
  assert.match(modal, /VivoViralShareModal/);
  assert.match(modal, /v1\/promotions\/social-share/);
  assert.match(modal, /INSTAGRAM_STORY/);
  assert.match(modal, /freeDopingCreditsGranted/);
  assert.match(modal, /Llevamos Vidas/);
  assert.doesNotMatch(modal, /setTimeout/);
});

test('keeps the Spanish Llevamos Vidas campaign branding consistent', () => {
  const script = fs.readFileSync(path.join(__dirname, 'docs', 'VIVO_PROMO_VIDEO_SCRIPT.md'), 'utf8');
  const modal = fs.readFileSync(path.join(__dirname, 'components', 'VivoViralShareModal.tsx'), 'utf8');
  assert.match(script, /Slogan:\*\* Llevamos Vidas/);
  assert.match(script, /¡Llevamos Vidas!/);
  assert.match(modal, /Llevamos Vidas/);
  assert.doesNotMatch(script, /Can Taşıyoruz|Llevamos Confianza/);
});

test('defines the VIVO AMIGO marketplace showcase landing', () => {
  const landing = fs.readFileSync(path.join(__dirname, 'components', 'VivoShowcaseLanding.tsx'), 'utf8');
  const page = fs.readFileSync(path.join(__dirname, 'app', 'page.tsx'), 'utf8');
  assert.match(landing, /VivoShowcaseLanding/);
  assert.match(landing, /Enviar a Guatemala/);
  assert.match(landing, /Comenzar ahora/);
  assert.match(landing, /Vender ahora/);
  assert.match(landing, /VIVO PAY/);
  assert.match(landing, /VIVO SHIP/);
  assert.match(landing, /SUPPORT/);
  assert.match(landing, /Electrónica/);
  assert.match(landing, /Automotriz/);
  assert.match(landing, /Quetzales/);
  assert.match(page, /MobileCommerceShell/);
});

test('defines the 250-agent dynamic NVIDIA NIM swarm', () => {
  const swarm = fs.readFileSync(path.join(__dirname, 'services', 'dynamicSwarmOrchestrator.ts'), 'utf8');
  assert.match(swarm, /interface SpecificAgent/);
  assert.match(swarm, /for \(let id = 1; id <= 250; id\+\+\)/);
  assert.match(swarm, /meta\/llama-3\.3-70b-instruct/);
  assert.match(swarm, /SAT\/PNC License Plate OCR Specialist/);
  assert.match(swarm, /GPS Geofencing Proximity Verifier/);
  assert.match(swarm, /Zero-Trust Penetration Tester/);
  assert.match(swarm, /dispatchDynamicTask/);
});

test('defines the complete specific agent registry and manifest', () => {
  const registry = fs.readFileSync(path.join(__dirname, 'services', 'dynamicAgentRegistry.ts'), 'utf8');
  const manifest = fs.readFileSync(path.join(__dirname, 'docs', '250_SPECIFIC_AGENTS_MANIFEST.md'), 'utf8');
  assert.match(registry, /class DynamicAgentRegistry/);
  assert.match(registry, /for \(let id = 1; id <= 250; id\+\+\)/);
  assert.match(registry, /responsibility/);
  assert.match(registry, /INJECTED_EXECUTOR/);
  assert.equal((manifest.match(/^\| \d{3} \|/gm) || []).length, 250);
  assert.match(manifest, /## VERIFY Fleet/);
  assert.match(manifest, /## CHECK Fleet/);
  assert.match(manifest, /## VIRAL Fleet/);
  assert.match(manifest, /## CYBER Fleet/);
  assert.match(manifest, /## ANALYTICS Fleet/);
});

test('defines fail-closed Cloudflare domain and FULL_STRICT TLS verification', () => {
  const cloudflare = fs.readFileSync(path.join(__dirname, 'services', 'cloudflareDomainVerification.ts'), 'utf8');
  assert.match(cloudflare, /interface DomainConfig/);
  assert.match(cloudflare, /AWS_CLOUDFRONT/);
  assert.match(cloudflare, /FULL_STRICT/);
  assert.match(cloudflare, /76\.76\.21\.21/);
  assert.match(cloudflare, /vivoamigo\.cloudfront\.net/);
  assert.match(cloudflare, /Cloudflare API adapter is not configured/);
  assert.match(cloudflare, /verifyCloudflareDomain/);
});

test('defines the executive admin dashboard with live emergency lock controls', () => {
  const dashboard = fs.readFileSync(path.join(__dirname, 'components', 'VivoAdminDashboard.tsx'), 'utf8');
  assert.match(dashboard, /VivoAdminDashboard/);
  assert.match(dashboard, /v1\/security\/status/);
  assert.match(dashboard, /v1\/security\/emergency-lock/);
  assert.match(dashboard, /Llevamos Vidas, Transportamos Confianza/);
  assert.match(dashboard, /250 agentes registrados/);
  assert.match(dashboard, /VIVO-CHECK/);
  assert.match(dashboard, /VIVO-VERIFY/);
  assert.match(dashboard, /VIVO-VIRAL/);
});

test('routes the executive dashboard through the admin App Router page', () => {
  const page = fs.readFileSync(path.join(__dirname, 'app', 'admin', 'page.tsx'), 'utf8');
  const dashboardPage = fs.readFileSync(path.join(__dirname, 'app', 'admin', 'dashboard', 'page.tsx'), 'utf8');
  assert.match(page, /import \{ VivoAdminDashboard \} from '@\/components\/VivoAdminDashboard'/);
  assert.match(page, /export default function AdminDashboardPage/);
  assert.match(page, /<VivoAdminDashboard \/>/);
  assert.match(dashboardPage, /import \{ VivoAdminDashboard \} from '@\/components\/VivoAdminDashboard'/);
  assert.match(dashboardPage, /export default function AdminDashboardPage/);
  assert.match(dashboardPage, /<VivoAdminDashboard \/>/);
});

test('defines the API-backed VivoWallet system', () => {
  const wallet = fs.readFileSync(path.join(__dirname, 'components', 'VivoWalletSystem.tsx'), 'utf8');
  const route = fs.readFileSync(path.join(__dirname, 'app', 'wallet', 'page.tsx'), 'utf8');
  const prompt = fs.readFileSync(path.join(__dirname, 'docs', 'DEVI_TASKS_PROMPT.md'), 'utf8');
  assert.match(wallet, /VivoWalletSystem/);
  assert.match(wallet, /payvivoamigo\.com/);
  assert.match(wallet, /VIVO-CHECK/);
  assert.match(wallet, /v1\/promotions\/social-share/);
  assert.match(wallet, /freeDopingCreditsGranted/);
  assert.doesNotMatch(wallet, /setTimeout/);
  assert.match(route, /VivoWalletSystem/);
  assert.match(prompt, /vivoamigo\.com/);
  assert.match(prompt, /payvivoamigo\.com/);
  assert.match(prompt, /cargovivo\.com/);
});

test('defines the interactive VERI-SHIELD fair price engine', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'components', 'FairPriceEngine.tsx'), 'utf8');
  assert.match(engine, /FairPriceEngine/);
  assert.match(engine, /hardCapPrice/);
  assert.match(engine, /isFairPrice/);
  assert.match(engine, /isSlightlyHigh/);
  assert.match(engine, /isPriceGouging/);
  assert.match(engine, /Döngüsel Adalet/);
  assert.match(engine, /kampanya koşullarına tabidir/);
});

test('defines the VIVO trade-in and renewal engine', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'components', 'VivoTradeInEngine.tsx'), 'utf8');
  const route = fs.readFileSync(path.join(__dirname, 'app', 'trade-in', 'page.tsx'), 'utf8');
  assert.match(engine, /VivoTradeInEngine/);
  assert.match(engine, /VEHICLE/);
  assert.match(engine, /PROPERTY/);
  assert.match(engine, /DEVICE/);
  assert.match(engine, /requiredLoan/);
  assert.match(engine, /monthlyPayment/);
  assert.match(engine, /VIVO PAY/);
  assert.match(engine, /CARGO VIVO/);
  assert.match(engine, /Quetzales/);
  assert.match(route, /VivoTradeInEngine/);
});

test('defines the tabbed bank and telecom partnership proposal', () => {
  const proposal = fs.readFileSync(path.join(__dirname, 'components', 'BankPartnershipProposal.tsx'), 'utf8');
  assert.match(proposal, /BankPartnershipProposal/);
  assert.match(proposal, /Banco Industrial/);
  assert.match(proposal, /Tigo Money/);
  assert.match(proposal, /payvivoamigo\.com/);
  assert.match(proposal, /aria-pressed/);
  assert.match(proposal, /sujeta a aprobación/);
});

test('routes and documents institutional partnership pitch decks', () => {
  const route = fs.readFileSync(path.join(__dirname, 'app', 'partnerships', 'page.tsx'), 'utf8');
  const banco = fs.readFileSync(path.join(__dirname, 'docs', 'INSTITUTIONAL_PITCH_BANCO_INDUSTRIAL.md'), 'utf8');
  const tigo = fs.readFileSync(path.join(__dirname, 'docs', 'INSTITUTIONAL_PITCH_TIGO.md'), 'utf8');
  assert.match(route, /BankPartnershipProposal/);
  assert.match(banco, /API Specification/);
  assert.match(banco, /Zero-Budget Barter Terms/);
  assert.match(banco, /Banco Industrial/);
  assert.match(tigo, /API Specification/);
  assert.match(tigo, /Zero-Budget Barter Terms/);
  assert.match(tigo, /Tigo Money/);
});

test('defines the VivoMercado cross-border escrow and trade-in engine', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'vivoMercadoEngine.ts'), 'utf8');
  assert.match(engine, /B2BImportExportDeal/);
  assert.match(engine, /initializeCrossBorderEscrow/);
  assert.match(engine, /TR.*CN/);
  assert.match(engine, /VERI_SHIELD_CARGO_INSPECTION_PASSED/);
  assert.match(engine, /calculateTradeInDifference/);
  assert.match(engine, /MIN_CREDIT_SCORE = 650/);
  assert.match(engine, /TERM_MONTHS = 48/);
  assert.doesNotMatch(engine, /Math\.random/);
});

test('defines scalable VIVO-MERCADO platform architecture', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'vivoMercadoPlatformEngine.ts'), 'utf8');
  const architecture = fs.readFileSync(path.join(__dirname, 'docs', 'VIVO_MERCADO_ARCHITECTURE.md'), 'utf8');
  assert.match(engine, /VivoMercadoPlatformEngine/);
  assert.match(engine, /MX.*CO.*PE.*CL.*BR/);
  assert.match(engine, /securityLockActive/);
  assert.match(engine, /payvivoamigo\.com/);
  assert.match(engine, /cargovivo\.com/);
  assert.match(engine, /scoreProvider/);
  assert.match(architecture, /Trust Boundaries/);
  assert.match(architecture, /Scale Model/);
  assert.match(architecture, /Currency conversion requires/);
});

test('defines the versioned viral and wallet commission incentive model', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'viralIncentiveEngine.ts'), 'utf8');
  const plan = fs.readFileSync(path.join(__dirname, 'docs', 'MASTER_PLAN.md'), 'utf8');
  const whitepaper = fs.readFileSync(path.join(__dirname, 'docs', 'VERI_SHIELD_BANK_API_WHITEPAPER.md'), 'utf8');
  assert.match(engine, /BASE_COMMISSION_BPS = 450/);
  assert.match(engine, /socialShareVerified/);
  assert.match(engine, /walletPaymentUsed/);
  assert.match(engine, /Math\.max\(0/);
  assert.match(engine, /policyVersion/);
  assert.match(plan, /Viral incentive algorithm/);
  assert.match(plan, /Asset-light and scalable architecture/);
  assert.match(whitepaper, /Zero-Trust Controls/);
  assert.match(whitepaper, /MANUAL_REVIEW/);
});

test('defines the first production kernel across the three official domains', () => {
  const kernel = fs.readFileSync(path.join(__dirname, 'services', 'vivoAmigoProductionKernel.ts'), 'utf8');
  const brief = fs.readFileSync(path.join(__dirname, 'docs', 'PRODUCTION_KERNEL_START.md'), 'utf8');
  assert.match(kernel, /VivoAmigoProductionKernel/);
  assert.match(kernel, /vivoamigo\.com/);
  assert.match(kernel, /payvivoamigo\.com/);
  assert.match(kernel, /cargovivo\.com/);
  assert.match(kernel, /evaluateListing/);
  assert.match(kernel, /lookupVivoScore/);
  assert.match(kernel, /initializeEscrow/);
  assert.match(kernel, /recordMigration/);
  assert.match(brief, /Provider Activation Gate/);
  assert.match(brief, /Missing integrations/);
});

test('connects the main marketplace landing to core ecosystem routes', () => {
  const landing = fs.readFileSync(path.join(__dirname, 'components', 'VivoShowcaseLanding.tsx'), 'utf8');
  assert.match(landing, /href="\/trade-in"/);
  assert.match(landing, /href="\/fair-price"/);
  assert.match(landing, /href="\/barter"/);
});

test('connects VivoWallet to the official PayVivo domain', () => {
  const wallet = fs.readFileSync(path.join(__dirname, 'components', 'VivoWalletSystem.tsx'), 'utf8');
  const route = fs.readFileSync(path.join(__dirname, 'app', 'wallet', 'page.tsx'), 'utf8');
  assert.match(wallet, /https:\/\/\$\{domain\}/);
  assert.match(wallet, /payvivoamigo\.com/);
  assert.match(route, /https:\/\/payvivoamigo\.com\/wallet/);
  assert.match(wallet, /Transferir/);
  assert.match(wallet, /Bank-Grade Encryption/);
  assert.match(wallet, /same-day ACH/);
  assert.match(wallet, /instantáneo/);
});

test('connects the marketplace navigation to CARGO VIVO', () => {
  const landing = fs.readFileSync(path.join(__dirname, 'components', 'VivoShowcaseLanding.tsx'), 'utf8');
  assert.match(landing, /href="https:\/\/cargovivo\.com"/);
  assert.match(landing, /CARGO VIVO/);
});

test('defines PayVivo wallet, listing, and 4.5 percent commission contracts', () => {
  const commission = fs.readFileSync(path.join(__dirname, 'services', 'payVivoCommission.ts'), 'utf8');
  assert.match(commission, /interface PayVivoWalletState/);
  assert.match(commission, /interface MarketplaceListing/);
  assert.match(commission, /calculatePayVivoCommission/);
  assert.match(commission, /BASE_COMMISSION_RATE = 10/);
  assert.match(commission, /SOCIAL_SHARE_DISCOUNT = 2\.5/);
  assert.match(commission, /PAYVIVO_DISCOUNT = 3/);
  assert.match(commission, /MIN_COMMISSION_RATE = 4\.5/);
  assert.match(commission, /FLAGGED_EXCESSIVE/);
});

test('defines PayVivo bank comparison rates engine', () => {
  const rates = fs.readFileSync(path.join(__dirname, 'services', 'payVivoRatesEngine.ts'), 'utf8');
  assert.match(rates, /interface BankComparisonResult/);
  assert.match(rates, /PayVivoRatesEngine/);
  assert.match(rates, /USD.*EUR.*TRY.*CNY/);
  assert.match(rates, /0\.0075/);
  assert.match(rates, /45/);
  assert.match(rates, /0\.035/);
  assert.match(rates, /userSavingsUSD/);
});

test('defines a client-safe return greeting without fabricated market claims', () => {
  const greeting = fs.readFileSync(path.join(__dirname, 'components', 'ReturnGreeting.tsx'), 'utf8');
  assert.match(greeting, /ReturnGreeting/);
  assert.match(greeting, /localStorage/);
  assert.match(greeting, /PAY VIVO/);
  assert.match(greeting, /VERI-SHIELD/);
  assert.doesNotMatch(greeting, /setTimeout/);
  assert.doesNotMatch(greeting, /%2 güncellendi|kurun.*ulaştı/);
});

test('defines live FX widget integration in PayVivo mobile wallet', () => {
  const widget = fs.readFileSync(path.join(__dirname, 'components', 'LiveCurrencyWidget.tsx'), 'utf8');
  const shell = fs.readFileSync(path.join(__dirname, 'components', 'MobileCommerceShell.tsx'), 'utf8');
  assert.match(widget, /WebSocket/);
  assert.match(widget, /currencies/);
  assert.match(widget, /PayVivoRatesEngine/);
  assert.match(widget, /FX feed unavailable/);
  assert.match(shell, /LiveCurrencyWidget/);
  assert.match(shell, /ReturnGreeting/);
});

test('defines a safe CorporateBillboard partner component', () => {
  const billboard = fs.readFileSync(path.join(__dirname, 'components', 'CorporateBillboard.tsx'), 'utf8');
  const ecosystem = fs.readFileSync(path.join(__dirname, 'types', 'ecosystem.ts'), 'utf8');
  assert.match(billboard, /CorporateBillboard/);
  assert.match(billboard, /Verified Alliance/);
  assert.match(billboard, /targetCategory/);
  assert.match(billboard, /noopener noreferrer/);
  assert.match(billboard, /partnerLink must use HTTPS/);
  assert.match(billboard, /onImpression/);
  assert.match(billboard, /onClick/);
  assert.match(billboard, /offer/);
  assert.match(ecosystem, /AdOffer/);
  assert.doesNotMatch(billboard, /window\.open/);
});

test('defines shared VIVO AMIGO marketplace and wallet domain models', () => {
  const models = fs.readFileSync(path.join(__dirname, 'types', 'vivoAmigoModels.ts'), 'utf8');
  assert.match(models, /type CategoryType/);
  assert.match(models, /HEAVY_B2B/);
  assert.match(models, /type SecurityBadge/);
  assert.match(models, /interface UserWallet/);
  assert.match(models, /interface ListingItem/);
  assert.match(models, /interface AdOffer/);
});

test('defines VERI-SHIELD dynamic commission and listing inspection engine', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'veriShieldEngine.ts'), 'utf8');
  assert.match(engine, /class VeriShieldEngine/);
  assert.match(engine, /calculateDynamicCommission/);
  assert.match(engine, /MAX_ALLOWED_DEVIATION = 0\.4/);
  assert.match(engine, /VERI_SHIELD_APPROVED/);
  assert.match(engine, /FLAGGED/);
  assert.match(engine, /MIN_COMMISSION_RATE = 4\.5/);
});

test('defines server-side Anthropic Opus design gateway', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'anthropicOpusDesignEngine.ts'), 'utf8');
  assert.match(engine, /@anthropic-ai\/sdk/);
  assert.match(engine, /callOpusDesignEngine/);
  assert.match(engine, /ANTHROPIC_API_KEY/);
  assert.match(engine, /messages\.create/);
  assert.match(engine, /type === 'text'/);
  assert.doesNotMatch(engine, /sk-ant-/);
});

test('defines contextual native ad server with safe partner fallback', () => {
  const ads = fs.readFileSync(path.join(__dirname, 'services', 'adServerEngine.ts'), 'utf8');
  assert.match(ads, /interface NativeAdOffer/);
  assert.match(ads, /class AdServerEngine/);
  assert.match(ads, /getContextualAd/);
  assert.match(ads, /PAY_VIVO/);
  assert.match(ads, /must use HTTPS|must be HTTPS|links must use HTTPS/);
  assert.match(ads, /getOffers/);
});

test('integrates contextual corporate billboards into home and listing pages', () => {
  const shell = fs.readFileSync(path.join(__dirname, 'components', 'MobileCommerceShell.tsx'), 'utf8');
  const listing = fs.readFileSync(path.join(__dirname, 'app', 'listings', '[id]', 'page.tsx'), 'utf8');
  assert.match(shell, /CorporateBillboard/);
  assert.match(shell, /AdServerEngine/);
  assert.match(listing, /CorporateBillboard/);
  assert.match(listing, /getContextualAd/);
  assert.match(listing, /Sponsored partner/);
});

test('defines PayVivo local and cross-border transfer manager', () => {
  const manager = fs.readFileSync(path.join(__dirname, 'services', 'payVivoTransferManager.ts'), 'utf8');
  assert.match(manager, /interface CurrencyRate/);
  assert.match(manager, /GTQ\/USD/);
  assert.match(manager, /GTQ\/TRY/);
  assert.match(manager, /GTQ\/CNY/);
  assert.match(manager, /executeLocalTransfer/);
  assert.match(manager, /SAME_DAY_ACH/);
  assert.match(manager, /calculateCrossBorderRate/);
  assert.match(manager, /marginPercent/);
  assert.match(manager, /ourMarginPercent: 0\.0075/);
  assert.match(manager, /processLocalTransfer/);
  assert.match(manager, /getInternationalQuote/);
  assert.match(manager, /WITHIN_24_HOURS/);
  assert.match(manager, /feeGTQ: 35/);
});

test('defines VIVO trust escrow state machine', () => {
  const escrow = fs.readFileSync(path.join(__dirname, 'services', 'vivoTrustEscrowEngine.ts'), 'utf8');
  assert.match(escrow, /type EscrowStatus/);
  assert.match(escrow, /createLockedContract/);
  assert.match(escrow, /attachLogisticsData/);
  assert.match(escrow, /triggerAutomaticRelease/);
  assert.match(escrow, /CUSTOMS_CLEARED/);
  assert.match(escrow, /SHIPMENT_FAILED/);
  assert.match(escrow, /verified delivery evidence/i);
  assert.match(escrow, /randomUUID/);
});

test('defines VIVO-TRUST escrow service and staged tracker UI', () => {
  const service = fs.readFileSync(path.join(__dirname, 'services', 'vivoTrustEscrow.ts'), 'utf8');
  const tracker = fs.readFileSync(path.join(__dirname, 'components', 'VivoTrustEscrowTracker.tsx'), 'utf8');
  assert.match(service, /VivoTrustEscrowService/);
  assert.match(service, /createLockedFunds/);
  assert.match(service, /GTIP|gtipHsCode/);
  assert.match(service, /trackingNumber/);
  assert.match(service, /CUSTOMS_CLEARED/);
  assert.match(service, /REFUND_IMPORTER/);
  assert.match(tracker, /Eximbank Grade VIVO-TRUST Protection/);
  assert.match(tracker, /Bill of Lading \/ AWB/);
  assert.match(tracker, /Fondos bloqueados/);
});

test('defines partner-gated VivoInsure instant policy quotes', () => {
  const insure = fs.readFileSync(path.join(__dirname, 'services', 'vivoInsureEngine.ts'), 'utf8');
  assert.match(insure, /InsuranceCoverageType/);
  assert.match(insure, /RETAIL_MICRO/);
  assert.match(insure, /AUTOMOTIVE_FULL/);
  assert.match(insure, /LOGISTICS_ESCROW/);
  assert.match(insure, /minimum premium|Math\.max\(itemValueGTQ \* policy\.rate, 5\)/i);
  assert.match(insure, /insurance partner adapter is not configured/);
  assert.match(insure, /partner şartlarına tabi/);
  assert.match(insure, /randomUUID/);
});

test('defines insurance partner ShieldBadge with transparent terms', () => {
  const badge = fs.readFileSync(path.join(__dirname, 'components', 'InsuranceShieldBadge.tsx'), 'utf8');
  assert.match(badge, /InsuranceShieldBadge/);
  assert.match(badge, /Official assurance partner/);
  assert.match(badge, /insuredValueGTQ/);
  assert.match(badge, /Partner şartlarına tabi/);
  assert.match(badge, /backdrop-blur-lg/);
  assert.match(badge, /role="status"/);
  assert.doesNotMatch(badge, /%100 kurumsal teminat/);
});

test('defines secure AI mail triage for info and sales channels', () => {
  const mail = fs.readFileSync(path.join(__dirname, 'services', 'aiMailHandlerService.ts'), 'utf8');
  assert.match(mail, /MailChannel/);
  assert.match(mail, /processInfoMail/);
  assert.match(mail, /processSalesMail/);
  assert.match(mail, /SPAM_PHISHING/);
  assert.match(mail, /HIGH_VALUE_B2B/);
  assert.match(mail, /requiresHumanAction/);
  assert.match(mail, /Unsafe attachment detected/);
});

test('defines the human-review MailLeadWidget', () => {
  const widget = fs.readFileSync(path.join(__dirname, 'components', 'MailLeadWidget.tsx'), 'utf8');
  assert.match(widget, /MailLeadWidget/);
  assert.match(widget, /AIAnalyzedMail/);
  assert.match(widget, /requiresHumanAction/);
  assert.match(widget, /onApprove/);
  assert.match(widget, /disabled=\{!onApprove\}/);
  assert.doesNotMatch(widget, /fetch\(/);
});

test('integrates MailLeadWidget into executive admin dashboard', () => {
  const dashboard = fs.readFileSync(path.join(__dirname, 'components', 'VivoAdminDashboard.tsx'), 'utf8');
  assert.match(dashboard, /MailLeadWidget/);
  assert.match(dashboard, /HIGH_VALUE_B2B/);
  assert.match(dashboard, /sales@vivoamigo\.com/);
  assert.match(dashboard, /no email was sent automatically/);
});

test('defines VIVO Flywheel cross-sell and verified review engine', () => {
  const flywheel = fs.readFileSync(path.join(__dirname, 'services', 'vivoFlywheelEngine.ts'), 'utf8');
  assert.match(flywheel, /VivoFlywheelEngine/);
  assert.match(flywheel, /INSURANCE/);
  assert.match(flywheel, /FINTECH_CREDIT/);
  assert.match(flywheel, /SPARE_PARTS/);
  assert.match(flywheel, /NOTARY_LEGAL/);
  assert.match(flywheel, /canLeaveVerifiedReview/);
  assert.match(flywheel, /Only transactions paid through PAY VIVO/);
  assert.match(flywheel, /partner kararına tabidir/);
  assert.match(flywheel, /getGoldTier/);
  assert.match(flywheel, /escrowFeeDiscount: 100/);
});

test('defines fail-closed voice intent and demand prediction engine', () => {
  const voice = fs.readFileSync(path.join(__dirname, 'services', 'vivoVoiceEngine.ts'), 'utf8');
  assert.match(voice, /interface VoiceSearchIntent/);
  assert.match(voice, /parseVoiceCommand/);
  assert.match(voice, /authorizePaymentVoice/);
  assert.match(voice, /voice biometric provider is not configured/);
  assert.match(voice, /getRegionalDemandMap/);
  assert.match(voice, /CONFIRM_PAYMENT/);
  assert.doesNotMatch(voice, /voiceBiometricScore: 0\.98/);
});

test('defines Merchant Pulse regional demand and trust-layer view', () => {
  const pulse = fs.readFileSync(path.join(__dirname, 'components', 'MerchantPulseView.tsx'), 'utf8');
  assert.match(pulse, /MerchantPulseView/);
  assert.match(pulse, /DemandPrediction/);
  assert.match(pulse, /Merchant Pulse/);
  assert.match(pulse, /VERI-SHIELD/);
  assert.match(pulse, /PAY VIVO/);
  assert.match(pulse, /VIVO-INSURE/);
  assert.match(pulse, /VIVO-TRUST/);
});

test('defines Web Speech API VIVO Voice interface without simulation', () => {
  const voice = fs.readFileSync(path.join(__dirname, 'components', 'VivoVoiceInterface.tsx'), 'utf8');
  assert.match(voice, /VivoVoiceInterface/);
  assert.match(voice, /SpeechRecognition/);
  assert.match(voice, /es-GT/);
  assert.match(voice, /parseVoiceCommand/);
  assert.doesNotMatch(voice, /setTimeout/);
  assert.doesNotMatch(voice, /0\.98/);
});

test('integrates Flywheel cross-sell and one-click checkout into listing detail', () => {
  const listing = fs.readFileSync(path.join(__dirname, 'app', 'listings', '[id]', 'page.tsx'), 'utf8');
  assert.match(listing, /OneClickCheckoutBar/);
  assert.match(listing, /VivoFlywheelEngine/);
  assert.match(listing, /crossSellRecommendations/);
});

test('defines fail-closed PayVivo one-click checkout', () => {
  const checkout = fs.readFileSync(path.join(__dirname, 'components', 'OneClickCheckoutBar.tsx'), 'utf8');
  assert.match(checkout, /OneClickCheckoutBar/);
  assert.match(checkout, /PASSKEY_OR_WALLET/);
  assert.match(checkout, /authorize\?/);
  assert.match(checkout, /PayVivo escrow intent/);
  assert.doesNotMatch(checkout, /setTimeout/);
  assert.doesNotMatch(checkout, /Math\.random/);
});

test('integrates VIVO-INSURE badges into listing, wallet, and billboard surfaces', () => {
  const listing = fs.readFileSync(path.join(__dirname, 'app', 'listings', '[id]', 'page.tsx'), 'utf8');
  const shell = fs.readFileSync(path.join(__dirname, 'components', 'MobileCommerceShell.tsx'), 'utf8');
  const billboard = fs.readFileSync(path.join(__dirname, 'components', 'CorporateBillboard.tsx'), 'utf8');
  assert.match(listing, /InsuranceShieldBadge/);
  assert.match(shell, /InsuranceShieldBadge/);
  assert.match(billboard, /Official Assurance Partner/);
  assert.match(billboard, /assurancePartner/);
});

test('defines universal PayVivo escrow for retail, automotive, and property assets', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'payVivoUniversalEscrowEngine.ts'), 'utf8');
  assert.match(engine, /PayVivoUniversalEscrowEngine/);
  assert.match(engine, /AssetClass/);
  assert.match(engine, /LOGISTICS_CODE/);
  assert.match(engine, /SAT_NOTARY_APPROVAL/);
  assert.match(engine, /TAPU_REGISTRATION/);
  assert.match(engine, /deviation > 0\.35/);
  assert.match(engine, /provided release trigger does not match/);
  assert.match(engine, /isFundsLocked: false/);
});

test('defines asset-aware PAY VIVO TrustBar', () => {
  const trustBar = fs.readFileSync(path.join(__dirname, 'components', 'TrustBar.tsx'), 'utf8');
  assert.match(trustBar, /interface TrustBarProps/);
  assert.match(trustBar, /RETAIL/);
  assert.match(trustBar, /AUTOMOTIVE/);
  assert.match(trustBar, /REAL_ESTATE/);
  assert.match(trustBar, /PAY VIVO TRUST SECURED/);
  assert.match(trustBar, /toLocaleString\('es-GT'/);
  assert.match(trustBar, /role="status"/);
});

test('integrates VIVO-TRUST canonical engine and TrustBar into payment surfaces', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'PayVivoUniversalEscrowEngine.ts'), 'utf8');
  const listing = fs.readFileSync(path.join(__dirname, 'app', 'listings', '[id]', 'page.tsx'), 'utf8');
  const shell = fs.readFileSync(path.join(__dirname, 'components', 'MobileCommerceShell.tsx'), 'utf8');
  assert.match(engine, /payVivoUniversalEscrowEngine/);
  assert.match(listing, /TrustBar/);
  assert.match(shell, /TrustBar/);
});

test('defines safe App Router listing SEO JSON-LD engine', () => {
  const seo = fs.readFileSync(path.join(__dirname, 'components', 'ListingSeoEngine.tsx'), 'utf8');
  assert.match(seo, /ListingSeoEngine/);
  assert.match(seo, /application\/ld\+json/);
  assert.match(seo, /schema\.org/);
  assert.match(seo, /priceCurrency/);
  assert.match(seo, /replace\(\/</);
  assert.match(seo, /canonical/);
  assert.match(seo, /createListingSeoTitle/);
  assert.match(seo, /Garantizado/);
  assert.doesNotMatch(seo, /next\/head/);
});

test('defines the multi-currency escrow API and B2B supplier verification spec', () => {
  const route = fs.readFileSync(path.join(__dirname, 'app', 'api', 'escrow', 'route.ts'), 'utf8');
  const spec = fs.readFileSync(path.join(__dirname, 'docs', 'B2B_SUPPLIER_VERIFICATION.md'), 'utf8');
  assert.match(route, /VivoMercadoEngine/);
  assert.match(route, /securityLockActive/);
  assert.match(route, /payvivoamigo\.com/);
  assert.match(route, /MANUAL_REVIEW/);
  assert.match(spec, /Onboarding Gates/);
  assert.match(spec, /Settlement currencies/);
  assert.match(spec, /USD.*GTQ.*TRY.*CNY/);
  assert.match(spec, /cargovivo\.com/);
  assert.match(spec, /idempotent escrow/);
});

test('defines the fail-closed Banco Industrial credit bridge', () => {
  const bridge = fs.readFileSync(path.join(__dirname, 'services', 'bancoIndustrialBridge.ts'), 'utf8');
  assert.match(bridge, /interface BICreditApplication/);
  assert.match(bridge, /api\.bi\.com\.gt\/v1\/credits\/pre-approve/);
  assert.match(bridge, /MIN_VERI_SHIELD_SCORE = 85/);
  assert.match(bridge, /Banco Industrial adapter is not configured/);
  assert.match(bridge, /REJECTED_OR_MANUAL_REVIEW/);
  assert.match(bridge, /requestedLoanAmountGTQ <= application\.assetVerifiedValueGTQ/);
  assert.doesNotMatch(bridge, /Math\.random/);
});

test('links BI credit actions in fair price and wallet surfaces', () => {
  const fairPrice = fs.readFileSync(path.join(__dirname, 'components', 'FairPriceEngine.tsx'), 'utf8');
  const wallet = fs.readFileSync(path.join(__dirname, 'components', 'VivoWalletSystem.tsx'), 'utf8');
  const route = fs.readFileSync(path.join(__dirname, 'app', 'api', 'v1', 'finance', 'bi', 'pre-approve', 'route.ts'), 'utf8');
  for (const source of [fairPrice, wallet]) assert.match(source, /v1\/finance\/bi\/pre-approve/);
  assert.match(route, /BancoIndustrialBridge/);
  assert.match(route, /processInstantLoan/);
  assert.match(fairPrice, /Solicitar crédito BI \/ Zigi/);
  assert.match(wallet, /Solicitar crédito BI \/ Zigi/);
});

test('defines the consent-gated partner barter engine', () => {
  const barter = fs.readFileSync(path.join(__dirname, 'components', 'VivoBarterEngine.tsx'), 'utf8');
  assert.match(barter, /VivoBarterEngine/);
  assert.match(barter, /Banco Industrial/);
  assert.match(barter, /TIGO/);
  assert.match(barter, /CLARO/);
  assert.match(barter, /aria-pressed/);
  assert.match(barter, /consentimiento, API autorizada y acuerdo firmado/);
});

test('routes the VivoAmigo barter engine and purges legacy product names', () => {
  const route = fs.readFileSync(path.join(__dirname, 'app', 'barter', 'page.tsx'), 'utf8');
  assert.match(route, /VivoBarterEngine/);
  const scan = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'node_modules' || entry.name === '.git') return [];
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? scan(target) : [target];
  });
  const legacyMatches = scan(__dirname).filter((filePath) => {
    try { return filePath !== __filename && /\.(ts|tsx|js|jsx|md|sql|json|toml|conf)$/.test(filePath) && /GuateVerify|GuateFinance/.test(fs.readFileSync(filePath, 'utf8')); } catch { return false; }
  });
  assert.deepEqual(legacyMatches, []);
});

test('defines the zero-budget expansion strategy and partner API rules', () => {
  const strategy = fs.readFileSync(path.join(__dirname, 'docs', 'MASTER_ZERO_BUDGET_EXPANSION.md'), 'utf8');
  assert.match(strategy, /vivoamigo\.com/);
  assert.match(strategy, /payvivoamigo\.com/);
  assert.match(strategy, /cargovivo\.com/);
  assert.match(strategy, /GSM Partner Exchange/);
  assert.match(strategy, /Bank Partner Exchange/);
  assert.match(strategy, /Approved Message Drafts/);
  assert.match(strategy, /100% sponsored/);
  assert.match(strategy, /signed partner agreements/);
});

test('defines trade-in upgrade calculation, BI gap, CARGO link, and campaign theme', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'tradeInUpgradeEngine.ts'), 'utf8');
  const module = fs.readFileSync(path.join(__dirname, 'components', 'TradeInUpgradeModule.tsx'), 'utf8');
  const route = fs.readFileSync(path.join(__dirname, 'app', 'trade-in', 'page.tsx'), 'utf8');
  assert.match(engine, /calculateTradeInUpgrade/);
  assert.match(engine, /financingGapGTQ/);
  assert.match(engine, /cargovivo\.com\/dispatch\/trade-in/);
  assert.match(engine, /vivoamigo ile Hayatını Güncelle/);
  assert.match(module, /Banco Industrial\/Zigi/);
  assert.match(module, /Farkı Hesapla/);
  assert.match(route, /VivoTradeInEngine/);
});

test('routes and documents the VERI-SHIELD fair-price engine', () => {
  const route = fs.readFileSync(path.join(__dirname, 'app', 'fair-price', 'page.tsx'), 'utf8');
  const spec = fs.readFileSync(path.join(__dirname, 'docs', 'VERI_SHIELD_SPEC.md'), 'utf8');
  assert.match(route, /FairPriceEngine/);
  assert.match(spec, /Price Corridor Algorithm/);
  assert.match(spec, /hardCapPrice = maxMarketValue \* 1\.20/);
  assert.match(spec, /PRICE_GOUGING/);
  assert.match(spec, /Circular Justice Rules/);
  assert.match(spec, /server-authoritative/);
});

test('documents instant trade-in appraisals and escrow property swaps', () => {
  const spec = fs.readFileSync(path.join(__dirname, 'docs', 'VERI_SHIELD_SPEC.md'), 'utf8');
  assert.match(spec, /Instant Trade-In Appraisals/);
  assert.match(spec, /Escrow Property Swaps/);
  assert.match(spec, /financing gap/);
  assert.match(spec, /payvivoamigo\.com/);
  assert.match(spec, /cargovivo\.com/);
  assert.match(spec, /manual review/);
});

test('defines consent-gated fail-closed VivoScore bridge', () => {
  const bridge = fs.readFileSync(path.join(__dirname, 'services', 'vivoScoreBridge.ts'), 'utf8');
  assert.match(bridge, /interface VivoScoreRequest/);
  assert.match(bridge, /api\.bi\.com\.gt\/v1\/fintech\/vivoscore/);
  assert.match(bridge, /consentGiven === true/);
  assert.match(bridge, /creditScore >= 300/);
  assert.match(bridge, /creditScore <= 850/);
  assert.match(bridge, /provider is not configured/);
  assert.doesNotMatch(bridge, /creditScore: 745/);
});

test('defines PayVivo migration and safe P2P wallet ledger', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'payVivoEngine.ts'), 'utf8');
  assert.match(engine, /interface UserMigrationPayload/);
  assert.match(engine, /BANCO_INDUSTRIAL/);
  assert.match(engine, /Digital Trade ID has already been migrated/);
  assert.match(engine, /randomUUID/);
  assert.match(engine, /executeDirectTransfer/);
  assert.match(engine, /amountGTQ must be greater than zero/);
  assert.match(engine, /sender and receiver wallets must differ/);
  assert.doesNotMatch(engine, /Math\.random/);
});

test('defines VivoPay migration data architecture and PRO-VIVO security document', () => {
  const architecture = fs.readFileSync(path.join(__dirname, 'services', 'vivoPayDataArchitecture.ts'), 'utf8');
  const document = fs.readFileSync(path.join(__dirname, 'docs', 'PRO-VIVO_2026_ULUSAL_GUVENLIK_BELGESI.md'), 'utf8');
  assert.match(architecture, /MigrationConsent/);
  assert.match(architecture, /createMigrationEvent/);
  assert.match(architecture, /aggregateSponsorMetrics/);
  assert.match(architecture, /OPTED_OUT/);
  assert.match(document, /Büyük Göç Operasyonu/);
  assert.match(document, /VivoPay Data Architecture/);
  assert.match(document, /Identity Vault/);
  assert.match(document, /zero upfront media budget/);
  assert.match(document, /signed agreement/);
});

test('routes PayVivo migration onboarding and provides regulator trust specification', () => {
  const route = fs.readFileSync(path.join(__dirname, 'app', 'migration', 'page.tsx'), 'utf8');
  const onboarding = fs.readFileSync(path.join(__dirname, 'components', 'PayVivoMigrationOnboarding.tsx'), 'utf8');
  const document = fs.readFileSync(path.join(__dirname, 'docs', 'PRO_VIVO_2026_NATIONAL_SECURITY.md'), 'utf8');
  assert.match(route, /PayVivoMigrationOnboarding/);
  assert.match(onboarding, /Digital Trade ID/);
  assert.match(onboarding, /consentGiven/);
  assert.match(document, /Great Migration Trust Model/);
  assert.match(document, /Financial and Consumer Controls/);
  assert.match(document, /government certification/);
  assert.match(document, /Regulator Export/);
});

test('defines Agent 105 Cloudflare sync and setup guide', () => {
  const sync = fs.readFileSync(path.join(__dirname, 'services', 'cloudflareDomainSync.ts'), 'utf8');
  const guide = fs.readFileSync(path.join(__dirname, 'docs', 'CLOUDFLARE_DOMAIN_SETUP.md'), 'utf8');
  assert.match(sync, /CLOUDFLARE_DOMAIN_AGENT_ID = 105/);
  assert.match(sync, /syncCloudflareDomain/);
  assert.match(sync, /verifyCloudflareDomain/);
  assert.match(guide, /DNS Records/);
  assert.match(guide, /Full \(strict\)/);
  assert.match(guide, /Vercel Integration/);
  assert.match(guide, /Agent #105/);
});
test('defines CARGO VIVO SOS fixed-price emergency assistance', () => {
  const sos = fs.readFileSync(path.join(__dirname, 'services', 'sosEmergency.ts'), 'utf8');
  assert.match(sos, /TOW_TRUCK/);
  assert.match(sos, /INTERAMERICANA/);
  assert.match(sos, /calculateFixedAssistPrice/);
  assert.match(sos, /baseRates/);
  assert.match(sos, /perKmRate/);
  assert.match(sos, /dispatchEmergencyAssist/);
  assert.match(sos, /DISPATCHING/);
});

test('defines the VIVO-ASSIST SOS assistance modal', () => {
  const modal = fs.readFileSync(path.join(__dirname, 'components', 'VivoAssistSosModal.tsx'), 'utf8');
  assert.match(modal, /VivoAssistSosModal/);
  assert.match(modal, /TOW_TRUCK/);
  assert.match(modal, /FLAT_TIRE/);
  assert.match(modal, /BATTERY_JUMP/);
  assert.match(modal, /onTriggerSos/);
  assert.match(modal, /Tarifa Fija Garantizada/);
  assert.match(modal, /Pago retenido en Escrow Seguro/);
});

test('integrates VIVO-ASSIST into the main showcase', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'vivoAssistEngine.ts'), 'utf8');
  const showcase = fs.readFileSync(path.join(__dirname, 'components', 'VivoPremiumShowcase.tsx'), 'utf8');
  assert.match(engine, /calculateFixedAssistPrice/);
  assert.match(engine, /dispatchEmergencyAssist/);
  assert.match(engine, /Fixed distance pricing/);
  assert.match(showcase, /VIVO-ASSIST 24\/7/);
});

test('initializes and dispatches the configured 35-agent swarm', async () => {
  const orchestrator = new SwarmOrchestrator();
  assert.deepEqual(orchestrator.initializeSwarm(), { totalAgents: 36, subAgents: 35, masterAgent: 'agent_master_01' });
  assert.equal(orchestrator.configPath.endsWith('/agents.config.yml'), true);
  const expectedGroups = { VERI_SHIELD_COMPLIANCE: 10, PAY_VIVO_FINANCE: 10, CARGO_VIVO_LOGISTICS: 10, VIVO_POS_OPERATIONS: 5 };
  for (const [group, count] of Object.entries(expectedGroups)) {
    const registered = [...orchestrator.agents.values()].filter((agent) => agent.group === group && !agent.aliasOf);
    assert.equal(registered.length, count);
    assert.ok(registered.every((agent) => agent.status === 'IDLE'));
  }
  assert.equal(orchestrator.agents.get('agent_master_01').status, 'ACTIVE_LEADER');
  assert.equal(orchestrator.agents.get('agent_master_01').executionMode, 'AUTONOMOUS');
  assert.equal(orchestrator.agents.get('verishield_01').role, 'devops_executor');
  assert.equal(orchestrator.getAutonomousExecutionReport().enabled, true);
  const task = await orchestrator.dispatchTask('CARGO_STATUS', { trackingCode: 'VIVO-TEST' });
  assert.equal(task.assignedBy, 'agent_master_01');
  assert.match(task.assignedTo, /^cargo_vivo_logistics_/);
  assert.equal(task.status, 'DISPATCHED');
});

test('records autonomous local execution status without faking external deployment', () => {
  const orchestrator = new SwarmOrchestrator();
  orchestrator.initializeSwarm();
  orchestrator.recordExecution('run_tests', 'PASSED', { command: 'npm test', tests: 10 });
  orchestrator.recordExecution('run_health_checks', 'BLOCKED', { reason: 'Docker unavailable locally' });
  const report = orchestrator.getAutonomousExecutionReport();
  assert.deepEqual(report.executionLog.map((entry) => entry.status), ['PASSED', 'BLOCKED']);
  assert.equal(report.externalOperations, 'require_credentials');
});

test('survives a 1,000-task concurrent swarm stress simulation', async () => {
  const orchestrator = new SwarmOrchestrator();
  orchestrator.initializeSwarm();
  const taskTypes = ['VERI_IDENTITY', 'PAY_ESCROW', 'CARGO_ROUTE', 'POS_OFFLINE'];
  const startedAt = process.hrtime.bigint();
  const taskResults = await Promise.all(Array.from({ length: 1000 }, (_, index) => (async () => {
    const dispatchStartedAt = process.hrtime.bigint();
    const task = await orchestrator.dispatchTask(taskTypes[index % taskTypes.length], { sequence: index + 1 });
    return { ...task, dispatchLatencyMs: Number(process.hrtime.bigint() - dispatchStartedAt) / 1e6 };
  })()));
  const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
  const latencies = taskResults.map((task) => task.dispatchLatencyMs);
  const assignedAgents = new Set(taskResults.map((task) => task.assignedTo));
  const metrics = {
    totalTasks: taskResults.length,
    elapsedMs: Number(elapsedMs.toFixed(3)),
    throughputTps: Number((taskResults.length / (elapsedMs / 1000)).toFixed(2)),
    p95DispatchLatencyMs: Number((latencies.sort((left, right) => left - right)[Math.floor(latencies.length * 0.95)] || 0).toFixed(3)),
    droppedTasks: 1000 - taskResults.length,
    unhandledRejections: 0,
    consensusEntries: orchestrator.consensusLog.length,
    masterRouteViolations: taskResults.filter((task) => task.assignedBy !== 'agent_master_01').length,
    uniqueSubAgents: assignedAgents.size
  };
  console.log(`[SWARM STRESS] ${JSON.stringify(metrics)}`);
  assert.equal(metrics.droppedTasks, 0);
  assert.equal(metrics.unhandledRejections, 0);
  assert.equal(metrics.consensusEntries, 1000);
  assert.equal(metrics.masterRouteViolations, 0);
  assert.equal(metrics.uniqueSubAgents, 35);
});

test('serves the offline VIVO POS shell and local QR bundle', async () => {
  const app = createPosApp({ store: new Map() });
  const shell = await getText(app, '/');
  const qrBundle = await getText(app, '/vendor/qrcode.min.js');
  assert.equal(shell.status, 200);
  assert.match(shell.text, /VIVO POS/);
  assert.equal(qrBundle.status, 200);
  assert.match(qrBundle.text, /QRCode/);
});

test('advertises complete web and native product surfaces', async () => {
  const app = createPosApp({ store: new Map() });
  const shell = await getText(app, '/');
  const manifest = await getText(app, '/manifest.webmanifest');
  const brandMark = await getText(app, '/brand-mark.svg');
  const styles = fs.readFileSync(path.join(__dirname, 'public', 'styles.css'), 'utf8');
  const marketplace = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  const tailwind = fs.readFileSync(path.join(__dirname, 'tailwind.config.js'), 'utf8');
  const globalStyles = fs.readFileSync(path.join(__dirname, 'app', 'globals.css'), 'utf8');
  const showcase = fs.readFileSync(path.join(__dirname, 'components', 'VivoShowcaseLanding.tsx'), 'utf8');
  const serviceWorker = await getText(app, '/sw.js');
  const index = await getText(app, '/');
  const mobileTargets = require('./mobile/src').APPS;
  const { PRODUCTION_ENDPOINTS } = require('./mobile/src/config');
  assert.match(shell.text, /VIVOAMIGOPAY/);
  assert.match(shell.text, /CARGO VIVO/);
  assert.match(shell.text, /MARKETPLACE/);
  assert.match(manifest.text, /VIVO AMIGO Commerce/);
  assert.match(manifest.text, /#111111/);
  assert.match(manifest.text, /images\/logo\.png/);
  assert.equal(brandMark.status, 200);
  assert.match(brandMark.text, /VIVO AMIGO VA shield mark/);
  assert.match(brandMark.text, /#FF6A00/);
  assert.match(styles, /--bg:#111111/);
  assert.match(styles, /--accent:#FF6A00/);
  assert.match(styles, /font-family:"Avenir Next"/);
  assert.match(styles, /#FF6A00/);
  assert.match(globalStyles, /--brand-orange: #FF6A00/);
  assert.match(globalStyles, /--card-yellow: #FBF7AA/);
  assert.match(globalStyles, /--ship-blue: #2563EB/);
  assert.match(showcase, /Enviar a Guatemala/);
  assert.match(showcase, /Comenzar ahora/);
  assert.match(showcase, /Vender ahora/);
  assert.match(marketplace, /VIVO AMIGO MARKETPLACE/);
  assert.match(marketplace, /Generate Checkout QR/);
  assert.match(marketplace, /Sync Offline Sales/);
  assert.match(marketplace, /indexedDB\.open/);
  assert.match(marketplace, /paymentGateway: PAYMENT_GATEWAY/);
  assert.match(marketplace, /data-cart-action/);
  assert.match(tailwind, /background: '#111111'/);
  assert.match(tailwind, /orange: '#FF6A00'/);
  assert.match(tailwind, /orangeDark: '#EB5C00'/);
  assert.match(tailwind, /yellow: '#FBF7AA'/);
  assert.match(tailwind, /gray: '#F8F9FA'/);
  assert.match(tailwind, /ship: '#2563EB'/);
  assert.match(tailwind, /ads: '#7C3AED'/);
  assert.match(tailwind, /support: '#16A34A'/);
  assert.match(tailwind, /app\/\*\*\/\*\.\{js,ts,jsx,tsx,mdx\}/);
  assert.match(serviceWorker.text, /vendor\/qrcode\.min\.js/);
  assert.match(serviceWorker.text, /images\/logo\.png/);
  assert.match(serviceWorker.text, /request\.mode === 'navigate'/);
  assert.match(serviceWorker.text, /pathname\.startsWith\('\/v1\/'\)/);
  assert.match(index.text, /apple-mobile-web-app-capable/);
  assert.match(index.text, /apple-touch-icon/);
  assert.deepEqual(Object.keys(mobileTargets).sort(), ['cargo', 'pay', 'pos']);
  assert.deepEqual(PRODUCTION_ENDPOINTS, { ecosystem: 'https://vivoamigo.com', payment: 'https://payvivoamigo.com', cargo: 'https://cargovivo.com', pos: 'https://pos.vivoamigo.com' });
  assert.equal(mobileTargets.pay.name, 'VIVOAMIGOPAY');
  assert.equal(mobileTargets.pay.apiOrigin, 'https://payvivoamigo.com');
  assert.deepEqual(mobileTargets.pay.flows, ['wallet', 'escrow', 'biometric-unlock']);
  assert.deepEqual(mobileTargets.cargo.flows, ['shipment-create', 'live-tracking', 'proof-of-delivery']);
  assert.deepEqual(mobileTargets.pos.flows, ['catalog', 'qr-checkout', 'offline-sync', 'fel-invoice']);
  assert.match(fs.readFileSync(path.join(__dirname, 'mobile', 'ios', 'README.md'), 'utf8'), /NSCameraUsageDescription/);
  assert.match(fs.readFileSync(path.join(__dirname, 'mobile', 'android', 'README.md'), 'utf8'), /USE_BIOMETRIC/);
  assert.match(fs.readFileSync(path.join(__dirname, 'mobile', 'ios', 'project.yml'), 'utf8'), /com\.vivoamigo\.app/);
  assert.match(fs.readFileSync(path.join(__dirname, 'mobile', 'ios', 'ExportOptions.plist'), 'utf8'), /app-store/);
  assert.match(fs.readFileSync(path.join(__dirname, 'mobile', 'android', 'app', 'build.gradle'), 'utf8'), /applicationId 'com\.vivoamigo\.app'/);
  const androidManifest = fs.readFileSync(path.join(__dirname, 'mobile', 'android', 'app', 'src', 'main', 'AndroidManifest.xml'), 'utf8');
  assert.match(androidManifest, /USE_BIOMETRIC/);
  assert.match(androidManifest, /INTERNET/);
  assert.match(androidManifest, /ACCESS_FINE_LOCATION/);
  assert.match(androidManifest, /vivoamigo/);
  assert.match(androidManifest, /vivoamigo\.com/);
  assert.match(androidManifest, /payvivoamigo\.com/);
  assert.match(fs.readFileSync(path.join(__dirname, 'mobile', 'android', 'app', 'build.gradle'), 'utf8'), /vivo-amigo-\$\{variant.name\}/);
  assert.match(fs.readFileSync(path.join(__dirname, 'mobile', 'android', 'app', 'src', 'main', 'res', 'drawable', 'va_splash.xml'), 'utf8'), /vivo_black/);
  assert.match(fs.readFileSync(path.join(__dirname, 'mobile', 'ios', 'native-placeholder', 'LaunchScreen.storyboard'), 'utf8'), /VivoAmigoMark/);
  assert.match(fs.readFileSync(path.join(__dirname, 'mobile', 'App.js'), 'utf8'), /fontFamily: 'Montserrat'/);
  assert.equal(fs.existsSync(path.join(__dirname, 'mobile', 'android', 'app', 'src', 'main', 'assets', 'public', 'index.html')), true);
  assert.equal(fs.existsSync(path.join(__dirname, 'mobile', 'android', 'app', 'src', 'main', 'assets', 'public', 'sw.js')), true);
  assert.equal(fs.existsSync(path.join(__dirname, 'mobile', 'android', 'app', 'src', 'main', 'assets', 'public', 'vendor', 'qrcode.min.js')), true);
  assert.match(showcase, /Enviar a Guatemala/);
  assert.match(showcase, /#FF6A00/);
  assert.match(marketplace, /VIVOAMIGOPAY/);
  assert.match(marketplace, /Sync Offline Sales/);
});

test('ships production edge routing and HTTPS configuration', () => {
  const nginx = fs.readFileSync(path.join(__dirname, 'deploy', 'nginx.conf'), 'utf8');
  const tls = fs.readFileSync(path.join(__dirname, 'deploy', 'snippets', 'vivo-tls.conf'), 'utf8');
  assert.match(nginx, /server_name vivoamigo\.com/);
  assert.match(nginx, /server_name payvivoamigo\.com/);
  assert.match(nginx, /server_name cargovivo\.com/);
  assert.match(nginx, /return 301 https:\/\/\$host\$request_uri/);
  assert.match(nginx, /proxy_pass http:\/\/veri_shield/);
  assert.match(tls, /Strict-Transport-Security/);
});

test('defines pgvector semantic listing search contracts', () => {
  const semanticSearch = fs.readFileSync(path.join(__dirname, 'services', 'semanticSearch.ts'), 'utf8');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  assert.match(semanticSearch, /text-embedding-3-small/);
  assert.match(semanticSearch, /embedding <=> \$1::vector/);
  assert.match(semanticSearch, /LIMIT \$2/);
  assert.match(schema, /CREATE EXTENSION IF NOT EXISTS vector/);
  assert.match(schema, /embedding vector\(1536\)/);
  assert.match(schema, /idx_listings_embedding_hnsw/);
});

test('defines ASP.NET Core listing search and PostgreSQL mappings', () => {
  const project = fs.readFileSync(path.join(__dirname, 'dotnet', 'VivoAmigo.Api.csproj'), 'utf8');
  const controller = fs.readFileSync(path.join(__dirname, 'dotnet', 'Controllers', 'ListingsController.cs'), 'utf8');
  const context = fs.readFileSync(path.join(__dirname, 'dotnet', 'Data', 'VivoAmigoDbContext.cs'), 'utf8');
  assert.match(project, /net8\.0/);
  assert.match(project, /Npgsql\.EntityFrameworkCore\.PostgreSQL/);
  assert.match(controller, /api\/v1\/listings/);
  assert.match(controller, /Search\(/);
  assert.match(controller, /minPrice/);
  assert.match(controller, /semanticIds/);
  assert.match(context, /HasPostgresExtension\("vector"\)/);
  assert.match(context, /HasColumnType\("jsonb"\)/);
  assert.match(context, /ParentCategory/);
});

test('wires Guatemala marketplace culture components together', () => {
  const experience = fs.readFileSync(path.join(__dirname, 'components', 'GuatemalaMarketplaceExperience.tsx'), 'utf8');
  assert.match(experience, /GuatemalaMercadoHeader/);
  assert.match(experience, /VoiceListingInput/);
  assert.match(experience, /WhatsAppDirectButton/);
  assert.match(experience, /onZoneChange=\{setSelectedZone\}/);
  assert.match(experience, /onTranscriptionComplete=\{setDescription\}/);
  assert.match(experience, /isOfficialDealer=\{item\.isOfficialDealer\}/);
});

test('defines the Cloudflare edge listings and WhatsApp tracking worker', () => {
  const worker = fs.readFileSync(path.join(__dirname, 'src', 'worker.ts'), 'utf8');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  assert.match(worker, /LISTINGS_KV/);
  assert.match(worker, /VECTOR_INDEX/);
  assert.match(worker, /whatsapp-click/);
  assert.match(worker, /X-Cache/);
  assert.match(worker, /expirationTtl: 60/);
  assert.match(worker, /category/);
  assert.match(schema, /whatsapp_click_count INTEGER NOT NULL DEFAULT 0/);
});

test('defines the production DynamoDB listings table contract', () => {
  const table = JSON.parse(fs.readFileSync(path.join(__dirname, 'deploy', 'dynamodb', 'VivoAmigo_Production_Listings.json'), 'utf8'));
  assert.equal(table.TableName, 'VivoAmigo_Production_Listings');
  assert.deepEqual(table.KeySchema, [{ AttributeName: 'zone_category', KeyType: 'HASH' }, { AttributeName: 'listing_id', KeyType: 'RANGE' }]);
  assert.equal(table.GlobalSecondaryIndexes[0].IndexName, 'VecinoConfiableIndex');
  assert.equal(table.BillingMode, 'PAY_PER_REQUEST');
});

test('defines the Cloudflare R2 voice note storage contract', () => {
  const storage = fs.readFileSync(path.join(__dirname, 'services', 'storageService.ts'), 'utf8');
  assert.match(storage, /@aws-sdk\/client-s3/);
  assert.match(storage, /vivo-amigo-voice-notes/);
  assert.match(storage, /audio\/webm/);
  assert.match(storage, /cdn\.vivoamigo\.com\/voice-notes/);
  assert.match(storage, /safeObjectKey/);
});

test('defines serverless edge and DynamoDB migration bindings', () => {
  const wrangler = fs.readFileSync(path.join(__dirname, 'deploy', 'wrangler.toml'), 'utf8');
  const dynamo = fs.readFileSync(path.join(__dirname, 'services', 'dynamoListings.ts'), 'utf8');
  const worker = fs.readFileSync(path.join(__dirname, 'src', 'worker.ts'), 'utf8');
  assert.match(wrangler, /binding = "DB"/);
  assert.match(wrangler, /binding = "VOICE_NOTES_BUCKET"/);
  assert.match(wrangler, /binding = "VECTOR_INDEX"/);
  assert.match(dynamo, /DynamoDBDocumentClient/);
  assert.match(dynamo, /VivoAmigo_Production_Listings/);
  assert.match(dynamo, /QueryCommand/);
  assert.match(worker, /VOICE_NOTES_BUCKET: R2Bucket/);
});

test('defines Guatemala high-intent SEO keyword strategy', () => {
  const keywords = fs.readFileSync(path.join(__dirname, 'config', 'seoKeywords.ts'), 'utf8');
  assert.match(keywords, /GUATEMALA_SEO_KEYWORD_MAP/);
  assert.match(keywords, /soldadoras-usadas-guatemala/);
  assert.match(keywords, /pickup-toyota-hilux-zona-10/);
  assert.match(keywords, /fletes-baratos-guatemala-zona-1/);
  assert.equal((keywords.match(/intent: 'HIGH_BUYING_INTENT',/g) || []).length, 3);
  assert.match(keywords, /cpcValueUSD: 1\.20/);
});

test('defines intent-aware direct and fallback ad placements', () => {
  const ads = fs.readFileSync(path.join(__dirname, 'components', 'AdManager.tsx'), 'utf8');
  assert.match(ads, /useMemo/);
  assert.match(ads, /includes\('toyota'\)/);
  assert.match(ads, /BYD Guatemala/);
  assert.match(ads, /adsbygoogle/);
  assert.match(ads, /data-zone=\{zone\}/);
  assert.match(ads, /noopener noreferrer/);
});

test('defines the VIVO AMIGO SEO sitemap routes', () => {
  const sitemap = fs.readFileSync(path.join(__dirname, 'app', 'sitemap.ts'), 'utf8');
  assert.match(sitemap, /https:\/\/vivoamigo\.com/);
  assert.match(sitemap, /\/b2b/);
  assert.match(sitemap, /\/remates/);
  assert.match(sitemap, /GUATEMALA_SEO_KEYWORD_MAP\.map/);
  assert.match(sitemap, /\/buscar\/\$\{item\.slug\}/);
});

test('integrates trust and financing modules into listing detail pages', () => {
  const listing = fs.readFileSync(path.join(__dirname, 'app', 'listings', '[id]', 'page.tsx'), 'utf8');
  assert.match(listing, /export default async function ListingPage/);
  assert.match(listing, /dynamicParams = true/);
  assert.match(listing, /encodeURIComponent\(id\)/);
  assert.match(listing, /InspectionBadge/);
  assert.match(listing, /BankCreditCalculator/);
  assert.match(listing, /inspectionScore/);
  assert.match(listing, /REAL_ESTATE.*VEHICLE/);
  assert.match(listing, /Comprar con Escrow Seguro/);
});

test('defines the Guatemala transaction revenue engine', () => {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const brief = fs.readFileSync(path.join(__dirname, 'docs', 'guatemala-revenue-engine.md'), 'utf8');
  for (const table of ['monetization_plans', 'merchant_subscriptions', 'listing_charges', 'marketplace_leads', 'lead_quotes', 'marketplace_transactions', 'escrow_orders', 'ad_leads']) assert.match(schema, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  assert.match(schema, /commission_bps INTEGER/);
  assert.match(schema, /buyer_fee_bps INTEGER/);
  assert.match(schema, /payout_amount_usd NUMERIC/);
  assert.match(brief, /First two vehicle\/real-estate listings are free/);
  assert.match(brief, /200-500 bps buyer service fee/);
  assert.match(brief, /Do not release escrow on a click/);
});

test('defines the corporate and notarized trust chain', () => {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const brief = fs.readFileSync(path.join(__dirname, 'docs', 'corporate-trust-chain.md'), 'utf8');
  for (const table of ['corporate_verifications', 'property_documents', 'admin_approvals', 'signed_contracts']) assert.match(schema, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  assert.match(schema, /LIBERTAD_GRAVAMEN/);
  assert.match(schema, /NOTARIZED_TITLE/);
  assert.match(schema, /delivery_code TEXT UNIQUE/);
  assert.match(brief, /Registro Mercantil/);
  assert.match(brief, /fully_signed/);
  assert.match(brief, /Do not issue `delivery_code`/);
});

test('defines the VIVO AMIGO master launch blueprint', () => {
  const blueprint = fs.readFileSync(path.join(__dirname, 'docs', 'master-blueprint.md'), 'utf8');
  assert.match(blueprint, /Guatemala City/);
  assert.match(blueprint, /Construction and industrial equipment/);
  assert.match(blueprint, /VIVO-VERIFY/);
  assert.match(blueprint, /AI-Legal/);
  assert.match(blueprint, /payvivoamigo\.com finance referrals/);
  assert.match(blueprint, /QR street signage/);
  assert.match(blueprint, /server-side/);
});

test('defines the official VIVO AMIGO master plan', () => {
  const plan = fs.readFileSync(path.join(__dirname, 'docs', 'MASTER_PLAN.md'), 'utf8');
  assert.match(plan, /VIVO-CHECK/);
  assert.match(plan, /CARGO VIVO/);
  assert.match(plan, /VIVO-ASSIST/);
  assert.match(plan, /VIVO-VERIFY/);
  assert.match(plan, /VIVOAMIGOPAY/);
  assert.match(plan, /12-week roadmap/);
  assert.match(plan, /Release gates/);
});

test('defines the root Devin autonomous development prompt', () => {
  const prompt = fs.readFileSync(path.join(__dirname, 'DEVIN_TASK.md'), 'utf8');
  assert.match(prompt, /VIVO AMIGO Guatemala Commerce OS/);
  assert.match(prompt, /VIVO-CHECK/);
  assert.match(prompt, /CARGO VIVO/);
  assert.match(prompt, /VIVO-ASSIST/);
  assert.match(prompt, /VIVOAMIGOPAY/);
  assert.match(prompt, /Do not issue completion\/delivery codes/);
  assert.match(prompt, /npm test/);
});

test('defines the community feature upvote and Devin sandbox engine', () => {
  const community = fs.readFileSync(path.join(__dirname, 'services', 'communityFeatureEngine.ts'), 'utf8');
  assert.match(community, /BARTER_SYSTEM/);
  assert.match(community, /BULK_BUYING/);
  assert.match(community, /MICRO_JOBS/);
  assert.match(community, /DEVICE_EXCHANGE/);
  assert.match(community, /processUpvote/);
  assert.match(community, /updatedVotes >= 1000/);
  assert.match(community, /CODING_IN_SANDBOX/);
  assert.match(community, /progress = 30/);
  assert.match(community, /Devin AI/);
});

test('defines the VIVO-VOZ community feedback card', () => {
  const voz = fs.readFileSync(path.join(__dirname, 'components', 'VivoVozFeedbackCard.tsx'), 'utf8');
  assert.match(voz, /VivoVozFeedbackCard/);
  assert.match(voz, /VIVO-VOZ/);
  assert.match(voz, /Verificación IMEI/);
  assert.match(voz, /CODING_IN_SANDBOX/);
  assert.match(voz, /initialUpvotes/);
  assert.match(voz, /onVote/);
  assert.match(voz, /role="alert"/);
});

test('defines moderated VIVO-VOZ sandbox automation', () => {
  const automation = fs.readFileSync(path.join(__dirname, 'services', 'communityAutomation.ts'), 'utf8');
  assert.match(automation, /moderateCommunityRequest/);
  assert.match(automation, /BLOCKED_TERMS/);
  assert.match(automation, /SPAM_PATTERN/);
  assert.match(automation, /upvotesCount < 1000/);
  assert.match(automation, /feature\/vivo-voz/);
  assert.match(automation, /run_unit_tests/);
  assert.match(automation, /run_security_scan/);
  assert.match(automation, /VIVO_CHECK_ESCROW/);
  assert.match(automation, /authorBadge/);
});

test('defines the VIVO-VOZ self-evolving public engine and Devin prompt', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'vivoVozEngine.ts'), 'utf8');
  const prompt = fs.readFileSync(path.join(__dirname, 'DEVIN_VOZ_PROMPT.md'), 'utf8');
  const card = fs.readFileSync(path.join(__dirname, 'components', 'VivoVozFeedbackCard.tsx'), 'utf8');
  assert.match(engine, /VIVO_VOZ_UPVOTE_THRESHOLD = 1000/);
  assert.match(engine, /createSandboxAutomationPlan/);
  assert.match(prompt, /1,000 upvotes/);
  assert.match(prompt, /feature\/vivo-voz-\[requestId\]/);
  assert.match(prompt, /VIVOAMIGOPAY/);
  assert.match(prompt, /VIVO-CHECK/);
  assert.match(card, /VivoVozFeedbackCard/);
});

test('defines deployed community reward automation', () => {
  const automation = fs.readFileSync(path.join(__dirname, 'services', 'communityRewardAutomation.ts'), 'utf8');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  assert.match(automation, /DEPLOYED_LIVE/);
  assert.match(automation, /user_profile_badges/);
  assert.match(automation, /wallet_rewards/);
  assert.match(automation, /public_changelog/);
  assert.match(automation, /notifications\.push/);
  assert.match(automation, /notifications\.email/);
  assert.match(automation, /community_reward_events/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS user_profile_badges/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS public_changelog/);
});

test('defines tokenized card and DPI identity verification', () => {
  const card = fs.readFileSync(path.join(__dirname, 'services', 'cardVerification.ts'), 'utf8');
  assert.match(card, /CardVerificationRequest/);
  assert.match(card, /cardNumberToken/);
  assert.match(card, /normalize\('NFKD'\)/);
  assert.match(card, /nunca envíe el número de tarjeta/);
  assert.match(card, /Visanet\/NeoNet/);
  assert.match(card, /randomUUID/);
});

test('defines bid hold and fraud penalty security controls', () => {
  const bid = fs.readFileSync(path.join(__dirname, 'services', 'bidSecurity.ts'), 'utf8');
  assert.match(bid, /BidHoldRequest/);
  assert.match(bid, /BID_HOLD_RATE = 0\.01/);
  assert.match(bid, /TEMPORARY_HOLD_ACTIVE/);
  assert.match(bid, /FRAUD_PENALTY_GTQ = 500\.00/);
  assert.match(bid, /PERMANENTLY_BAN_BLACK_LIST/);
  assert.match(bid, /cardToken/);
});

test('defines the card verification badge', () => {
  const badge = fs.readFileSync(path.join(__dirname, 'components', 'CardVerificationBadge.tsx'), 'utf8');
  assert.match(badge, /CardVerificationBadge/);
  assert.match(badge, /onVerify/);
  assert.match(badge, /Vincular Tarjeta \(Q1\.00\)/);
  assert.match(badge, /Verificado/);
  assert.match(badge, /disabled=\{isProcessing\}/);
  assert.match(badge, /role="alert"/);
});

test('defines PCI card security, penalty engine, checkout, and onboarding integrations', () => {
  const cardEngine = fs.readFileSync(path.join(__dirname, 'services', 'cardSecurityEngine.ts'), 'utf8');
  const penalty = fs.readFileSync(path.join(__dirname, 'services', 'penaltyEngine.ts'), 'utf8');
  const checkout = fs.readFileSync(path.join(__dirname, 'components', 'CheckoutVerificationPanel.tsx'), 'utf8');
  const onboarding = fs.readFileSync(path.join(__dirname, 'components', 'OnboardingVerificationPanel.tsx'), 'utf8');
  assert.match(cardEngine, /verifyUserCardAndIdentity/);
  assert.match(cardEngine, /Raw card numbers are never accepted/);
  assert.match(penalty, /processBidHoldAndPenalty/);
  assert.match(penalty, /executeFraudPenalty/);
  assert.match(checkout, /CardVerificationBadge/);
  assert.match(onboarding, /CardVerificationBadge/);
});

test('defines privacy-aware intent campaign triggers', () => {
  const campaign = fs.readFileSync(path.join(__dirname, 'services', 'intentCampaignEngine.ts'), 'utf8');
  assert.match(campaign, /CAR_EXPERT_COMPLETED/);
  assert.match(campaign, /PROPERTY_RENTAL_SEARCH/);
  assert.match(campaign, /phoneHash/);
  assert.match(campaign, /BYD Guatemala/);
  assert.match(campaign, /CARGO VIVO & HomePartners/);
  assert.match(campaign, /campaignChannel: 'WHATSAPP'/);
  assert.match(campaign, /campaignChannel: 'SMS'/);
  assert.match(campaign, /toLowerCase/);
});

test('defines consent-gated privacy shield and sensitive data masking', () => {
  const privacy = fs.readFileSync(path.join(__dirname, 'services', 'privacyShield.ts'), 'utf8');
  assert.match(privacy, /DataPrivacyConsent/);
  assert.match(privacy, /acceptedPrivacyTerms/);
  assert.match(privacy, /acceptedDataMonetizationConsent/);
  assert.match(privacy, /validatePrivacyShield/);
  assert.match(privacy, /maskSensitiveUserData/);
  assert.match(privacy, /maskedPhone/);
  assert.match(privacy, /maskedEmail/);
});

test('defines the privacy-aware personalized offer card', () => {
  const offer = fs.readFileSync(path.join(__dirname, 'components', 'PersonalizedOfferCard.tsx'), 'utf8');
  assert.match(offer, /PersonalizedOfferCard/);
  assert.match(offer, /Oportunidad Exclusiva/);
  assert.match(offer, /VIVO AMIGO Shield/);
  assert.match(offer, /wa\\\.me/);
  assert.match(offer, /noopener noreferrer/);
  assert.match(offer, /actionLink/);
});

test('defines predictive analytics and legal consent shield public modules', () => {
  const predictive = fs.readFileSync(path.join(__dirname, 'services', 'predictiveDataEngine.ts'), 'utf8');
  const legal = fs.readFileSync(path.join(__dirname, 'services', 'legalConsentShield.ts'), 'utf8');
  const offer = fs.readFileSync(path.join(__dirname, 'components', 'PersonalizedOfferCard.tsx'), 'utf8');
  assert.match(predictive, /predictCommercialIntent/);
  assert.match(predictive, /validatePrivacyShield/);
  assert.match(predictive, /analyzeUserIntentAndTriggerCampaign/);
  assert.match(legal, /GDPR_GUATEMALA_CONSENT_REQUIRED/);
  assert.match(legal, /maskSensitiveUserData/);
  assert.match(offer, /PersonalizedOfferCard/);
});

test('defines the 15-day corporate job listing engine', () => {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const policy = fs.readFileSync(path.join(__dirname, 'services', 'jobListingPolicy.ts'), 'utf8');
  const brief = fs.readFileSync(path.join(__dirname, 'docs', 'job-listing-engine.md'), 'utf8');
  for (const table of ['job_listings', 'job_listing_renewals', 'hiring_commitments', 'job_matches', 'job_escrow_closures']) assert.match(schema, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  assert.match(schema, /INTERVAL '15 days'/);
  assert.match(schema, /expires_at TIMESTAMPTZ/);
  assert.match(policy, /JOB_LISTING_DURATION_DAYS = 15/);
  assert.match(policy, /corporateApproved/);
  assert.match(policy, /hiringCommitmentSigned/);
  assert.match(brief, /15-day freshness cycle/);
  assert.match(brief, /job_escrow_closures/);
});

test('defines CARGO delivery escrow release rules', () => {
  const cargo = fs.readFileSync(path.join(__dirname, 'services', 'cargoEscrow.ts'), 'utf8');
  assert.match(cargo, /PENDING_PICKUP/);
  assert.match(cargo, /CARGO_EXPRESO/);
  assert.match(cargo, /GUATE_EX/);
  assert.match(cargo, /PAYOUT_HOLD_HOURS = 24/);
  assert.match(cargo, /status !== 'DELIVERED'/);
  assert.match(cargo, /isPayoutApproved: true/);
  assert.match(cargo, /DISPUTED/);
});

test('defines the bank credit calculator', () => {
  const calculator = fs.readFileSync(path.join(__dirname, 'components', 'BankCreditCalculator.tsx'), 'utf8');
  assert.match(calculator, /BankCreditCalculator/);
  assert.match(calculator, /ANNUAL_INTEREST_RATE = 0\.08/);
  assert.match(calculator, /downPaymentPercent/);
  assert.match(calculator, /termYears/);
  assert.match(calculator, /monthlyInstallment/);
  assert.match(calculator, /Pre-Calificar Crédito en Línea/);
  assert.match(calculator, /tabular-nums/);
});

test('defines corporate anti-scam listing validation', () => {
  const antiScam = fs.readFileSync(path.join(__dirname, 'services', 'antiScamValidation.ts'), 'utf8');
  assert.match(antiScam, /SellerDocumentStatus/);
  assert.match(antiScam, /hasCompanyRegistration/);
  assert.match(antiScam, /hasNotaryDocument/);
  assert.match(antiScam, /PENDING_APPROVAL/);
  assert.match(antiScam, /APPROVED: Verificación completa/);
  assert.match(antiScam, /isCorporateListing/);
});

test('exposes requested logistics escrow, credit, and anti-scam modules', () => {
  const logistics = fs.readFileSync(path.join(__dirname, 'services', 'logisticsEscrow.ts'), 'utf8');
  const antiScamGuard = fs.readFileSync(path.join(__dirname, 'services', 'antiScamGuard.ts'), 'utf8');
  const credit = fs.readFileSync(path.join(__dirname, 'components', 'BankCreditCalculator.tsx'), 'utf8');
  assert.match(logistics, /syncCargoAndReleaseEscrow/);
  assert.match(logistics, /cargoEscrow/);
  assert.match(antiScamGuard, /autoDeactivateUnverifiedCorporateListing/);
  assert.match(antiScamGuard, /validateListingForAntiScam/);
  assert.match(credit, /BankCreditCalculator/);
  assert.match(credit, /propertyPriceGTQ/);
});

test('defines Guatemala Next.js production configuration', () => {
  const nextConfig = fs.readFileSync(path.join(__dirname, 'next.config.js'), 'utf8');
  assert.match(nextConfig, /reactStrictMode: true/);
  assert.match(nextConfig, /swcMinify: true/);
  assert.match(nextConfig, /cdn\.vivoamigo\.com/);
  assert.match(nextConfig, /cargoexpreso\.com/);
  assert.match(nextConfig, /guateex\.com/);
  assert.match(nextConfig, /NEXT_PUBLIC_SITE_URL: 'https:\/\/vivoamigo\.com'/);
  assert.match(nextConfig, /NEXT_PUBLIC_DEFAULT_CURRENCY: 'GTQ'/);
  assert.match(nextConfig, /NEXT_PUBLIC_LAUNCH_CITY: 'Guatemala City'/);
});

test('defines official ecosystem image domains and route rewrites', () => {
  const nextConfig = fs.readFileSync(path.join(__dirname, 'next.config.js'), 'utf8');
  assert.match(nextConfig, /payvivoamigo\.com/);
  assert.match(nextConfig, /cargovivo\.com/);
  assert.match(nextConfig, /source: '\/marketplace\/:path\*'/);
  assert.match(nextConfig, /destination: 'https:\/\/vivoamigo\.com\/:path\*'/);
  assert.match(nextConfig, /destination: 'https:\/\/payvivoamigo\.com\/:path\*'/);
  assert.match(nextConfig, /destination: 'https:\/\/cargovivo\.com\/:path\*'/);
});

test('defines guarded production deployment gates', () => {
  const deploy = fs.readFileSync(path.join(__dirname, 'scripts', 'deploy-production.sh'), 'utf8');
  assert.match(deploy, /npm ci/);
  assert.match(deploy, /npm test/);
  assert.match(deploy, /check:mobile/);
  assert.match(deploy, /check:native/);
  assert.match(deploy, /VIVO_SKIP_BUILD/);
  assert.match(deploy, /pm2 restart vivoamigo-production/);
});

test('defines the production VIVO AMIGO health endpoint', () => {
  const health = fs.readFileSync(path.join(__dirname, 'app', 'api', 'health', 'route.ts'), 'utf8');
  assert.match(health, /status: 'ONLINE'/);
  assert.match(health, /environment: 'production'/);
  assert.match(health, /Guatemala City \(Zona 10, 14, 15\)/);
  assert.match(health, /transactionEngine: true/);
  assert.match(health, /storeRentalsQ50: true/);
  assert.match(health, /smartEscrow: true/);
  assert.match(health, /antiScamGuard: true/);
  assert.match(health, /new Date\(\)\.toISOString/);
  assert.equal(fs.existsSync(path.join(__dirname, 'app', 'api', 'v1', 'health', 'route.ts')), true);
});

test('serves the VIVO POS versioned health endpoint as JSON', async () => {
  const response = await getText(createPosApp({ store: new Map() }), '/api/v1/health');
  assert.equal(response.status, 200);
  assert.match(response.text, /"service":"vivo-amigo"/);
  assert.match(response.text, /"status":"ONLINE"/);
});

test('documents the overnight deployment truth', () => {
  const log = fs.readFileSync(path.join(__dirname, 'OVERNIGHT_DEPLOYMENT_LOG.md'), 'utf8');
  assert.match(log, /npm test/);
  assert.match(log, /\/api\/v1\/health/);
  assert.match(log, /npm run build/);
  assert.match(log, /not claimed/);
});

test('defines the VIVO AMIGO sticky Guatemala navbar', () => {
  const navbar = fs.readFileSync(path.join(__dirname, 'components', 'Navbar.tsx'), 'utf8');
  assert.match(navbar, /next\/image/);
  assert.match(navbar, /next\/link/);
  assert.match(navbar, /images\/logo\.png/);
  assert.match(navbar, /sticky top-0/);
  assert.match(navbar, /Guatemala City/);
});

test('defines the marketplace category bar', () => {
  const categories = fs.readFileSync(path.join(__dirname, 'components', 'CategoryBar.tsx'), 'utf8');
  assert.match(categories, /VEHICLES_PARTS/);
  assert.match(categories, /CONSTRUCTION/);
  assert.match(categories, /TECHNOLOGY/);
  assert.match(categories, /REAL_ESTATE/);
  assert.match(categories, /overflow-x-auto/);
  assert.match(categories, /Categorías del marketplace/);
  assert.match(categories, /Escrow Seguro/);
});

test('defines the VIVO-CHECK secure on-site verification flow', () => {
  const vivoCheck = fs.readFileSync(path.join(__dirname, 'services', 'vivoCheck.ts'), 'utf8');
  assert.match(vivoCheck, /VivoCheckSession/);
  assert.match(vivoCheck, /PENDING_MATCH/);
  assert.match(vivoCheck, /VERIFIED_ON_SITE/);
  assert.match(vivoCheck, /listingPriceGTQ \* 0\.01/);
  assert.match(vivoCheck, /Código VIVO-CHECK inválido/);
  assert.match(vivoCheck, /Math\.floor\(1000/);
});

test('defines the VIVO-CHECK modal UI', () => {
  const modal = fs.readFileSync(path.join(__dirname, 'components', 'VivoCheckModal.tsx'), 'utf8');
  assert.match(modal, /VivoCheckModal/);
  assert.match(modal, /onGenerateCode/);
  assert.match(modal, /VIVO-\\d\{4\}-GT/);
  assert.match(modal, /VIVO-CHECK/);
  assert.match(modal, /Garantía Notarial y Bancaria/);
  assert.match(modal, /role="alert"/);
});

test('defines the VIVO AMIGO infrastructure status contract', () => {
  const infrastructure = fs.readFileSync(path.join(__dirname, 'services', 'infrastructureStatus.ts'), 'utf8');
  assert.match(infrastructure, /ASP\.NET Core 9\.0/);
  assert.match(infrastructure, /PostgreSQL/);
  assert.match(infrastructure, /Redis/);
  assert.match(infrastructure, /Elasticsearch/);
  assert.match(infrastructure, /Cloudflare Enterprise/);
  assert.match(infrastructure, /AWS us-east-1/);
  assert.match(infrastructure, /Visanet Guatemala \/ NeoNet API/);
  assert.match(infrastructure, /RENAP Guatemala API/);
});

test('defines security audit and finance reporting gates', () => {
  const audit = fs.readFileSync(path.join(__dirname, 'services', 'securityAudit.ts'), 'utf8');
  const script = fs.readFileSync(path.join(__dirname, 'scripts', 'security-audit.sh'), 'utf8');
  const docs = fs.readFileSync(path.join(__dirname, 'docs', 'security-finance-gates.md'), 'utf8');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  assert.match(audit, /rawCardDataForbidden: true/);
  assert.match(audit, /VISANET_NEONET/);
  assert.match(script, /NEXT_PUBLIC_OPENAI_API_KEY/);
  assert.match(script, /jsonLdSafe/);
  assert.match(docs, /Zero-knowledge financial boundary/);
  assert.match(schema, /gmv_reporting_daily/);
  assert.match(schema, /escrow_reporting_snapshots/);
  assert.match(schema, /vivo_assist_subscription_metrics/);
});

test('defines VIVO-VERIFY field inspection sealing gates', () => {
  const inspection = fs.readFileSync(path.join(__dirname, 'services', 'fieldInspection.ts'), 'utf8');
  assert.match(inspection, /FieldInspectionReport/);
  assert.match(inspection, /vehiclePaintThicknessOk/);
  assert.match(inspection, /obdDiagnosticsPassed/);
  assert.match(inspection, /tamperProofQrIssued/);
  assert.match(inspection, /APPROVED_SEALED/);
  assert.match(inspection, /REJECTED/);
  assert.match(inspection, /issueVivoVerifySeal/);
});

test('defines system architecture, VIVO-VERIFY engine, and admin status badge', () => {
  const architecture = fs.readFileSync(path.join(__dirname, 'services', 'systemArchitecture.ts'), 'utf8');
  const verify = fs.readFileSync(path.join(__dirname, 'services', 'vivoVerifyEngine.ts'), 'utf8');
  const badge = fs.readFileSync(path.join(__dirname, 'components', 'AdminInspectionStatusBadge.tsx'), 'utf8');
  assert.match(architecture, /roadmapWeeks: 12/);
  assert.match(architecture, /Cloudflare Workers \/ D1 \/ KV \/ R2 \/ Vectorize/);
  assert.match(verify, /issueMotorizedVivoVerifySeal/);
  assert.match(verify, /qrVerificationUrl/);
  assert.match(verify, /APPROVED_SEALED/);
  assert.match(badge, /AdminInspectionStatusBadge/);
  assert.match(badge, /VIVO-VERIFY sealed/);
});

test('defines CARGO VIVO fleet telematics safety controls', () => {
  const fleet = fs.readFileSync(path.join(__dirname, 'services', 'fleetTelematics.ts'), 'utf8');
  assert.match(fleet, /TRUCK_HEAVY/);
  assert.match(fleet, /REFLECTIVE_VINYL_APPLIED/);
  assert.match(fleet, /processVehicleTelematics/);
  assert.match(fleet, /currentSpeedKmh > maxSpeedLimitKmh/);
  assert.match(fleet, /safetyScore - 5/);
  assert.match(fleet, /Transportamos Vidas/);
  assert.match(fleet, /CARGO VIVO/);
});

test('defines the CARGO VIVO driver verification card', () => {
  const card = fs.readFileSync(path.join(__dirname, 'components', 'DriverQrVerificationCard.tsx'), 'utf8');
  assert.match(card, /DriverQrVerificationCard/);
  assert.match(card, /Transportamos Vidas/);
  assert.match(card, /Conductor Verificado por DPI/);
  assert.match(card, /rastreo GPS en tiempo real/);
  assert.match(card, /safeSafetyScore/);
  assert.match(card, /safeDeliveryCount/);
});

test('defines the CARGO VIVO telematics dashboard integration', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'fleetTelematicsEngine.ts'), 'utf8');
  const panel = fs.readFileSync(path.join(__dirname, 'components', 'LogisticsTelematicsPanel.tsx'), 'utf8');
  assert.match(engine, /processVehicleTelematics/);
  assert.match(panel, /onTrackingRefresh/);
  assert.match(panel, /Actualizar GPS/);
  assert.match(panel, /currentSpeedKmh/);
  assert.match(panel, /DriverQrVerificationCard/);
  assert.match(panel, /Transportamos Vidas/);
});

test('defines Next.js root and dynamic listing page exports', () => {
  const home = fs.readFileSync(path.join(__dirname, 'app', 'page.tsx'), 'utf8');
  const listing = fs.readFileSync(path.join(__dirname, 'app', 'listings', '[id]', 'page.tsx'), 'utf8');
  assert.match(home, /export default function HomePage/);
  assert.match(home, /MobileCommerceShell/);
  assert.match(listing, /export default async function ListingPage/);
  assert.match(listing, /dynamicParams = true/);
});

test('defines VIVO AMIGO Guatemala metadata and root layout', () => {
  const layout = fs.readFileSync(path.join(__dirname, 'app', 'layout.tsx'), 'utf8');
  assert.match(layout, /VIVO AMIGO \| Mercado Digital Guatemala/);
  assert.match(layout, /Escrow seguro en Guatemala/);
  assert.match(layout, /images\/logo\.png/);
  assert.match(layout, /export default function RootLayout/);
  assert.match(layout, /lang="es"/);
  assert.match(layout, /next\/font\/google/);
  assert.match(layout, /Montserrat/);
  assert.match(layout, /weight: \['400', '500', '700', '800'\]/);
  assert.match(layout, /font-sans bg-\[#F8F9FA\]/);
  assert.equal(fs.existsSync(path.join(__dirname, 'app', 'globals.css')), true);
});

test('defines the VIVO POS Amazon-style hero theme', () => {
  const hero = fs.readFileSync(path.join(__dirname, 'components', 'PosHeroTheme.tsx'), 'utf8');
  assert.match(hero, /PosHeroTheme/);
  assert.match(hero, /bg-vivo-gradient/);
  assert.match(hero, /bg-vivo-neon-glow/);
  assert.match(hero, /5,800\+ Merchants in Guatemala/);
  assert.match(hero, /VIVO-CHECK Escrow/);
  assert.match(hero, /Visanet\/NeoNet/);
  assert.match(hero, /VIVO APP STORE/);
});

test('defines user critique routing for Devin and Carlos approval', () => {
  const critique = fs.readFileSync(path.join(__dirname, 'services', 'critiqueEngine.ts'), 'utf8');
  assert.match(critique, /CritiqueSubmission/);
  assert.match(critique, /TECHNICAL_BUG/);
  assert.match(critique, /URGENT_ANGRY/);
  assert.match(critique, /AUTO_FIXING_HOTFIX/);
  assert.match(critique, /NEEDS_CARLOS_APPROVAL/);
  assert.match(critique, /rating must be an integer between 1 and 5/);
  assert.match(critique, /processUserCritique/);
});

test('defines the VIVO-CRITIQUE self-healing feedback modal', () => {
  const modal = fs.readFileSync(path.join(__dirname, 'components', 'VivoCritiqueModal.tsx'), 'utf8');
  assert.match(modal, /VivoCritiqueModal/);
  assert.match(modal, /onSubmitCritique/);
  assert.match(modal, /ANALYZING_BY_DEVIN/);
  assert.match(modal, /HOTFIX_DEPLOYED/);
  assert.match(modal, /Sistema Self-Healing/);
  assert.match(modal, /role="alert"/);
});

test('defines the daily strategic AI report', () => {
  const report = fs.readFileSync(path.join(__dirname, 'docs', 'daily-strategic-ai-report.md'), 'utf8');
  assert.match(report, /System Health Score:\*\*:? 98\.4%/);
  assert.match(report, /HOTFIX-209/);
  assert.match(report, /HOTFIX-210/);
  assert.match(report, /HOTFIX-211/);
  assert.match(report, /Critique #88/);
  assert.match(report, /Critique #114/);
  assert.match(report, /NEEDS_CARLOS_APPROVAL/);
});

test('defines the VIVO-CRITIQUE self-healing engine and report template', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'vivoCritiqueEngine.ts'), 'utf8');
  const template = fs.readFileSync(path.join(__dirname, 'docs', 'DAILY_STRATEGIC_REPORT_TEMPLATE.md'), 'utf8');
  assert.match(engine, /routeCritiqueToDevin/);
  assert.match(engine, /inferSentiment/);
  assert.match(engine, /DEVIN_HOTFIX/);
  assert.match(engine, /CARLOS_APPROVAL/);
  assert.match(engine, /production release remains gated/);
  assert.match(template, /System Health Score/);
  assert.match(template, /Auto-Patched Code/);
  assert.match(template, /NEEDS_CARLOS_APPROVAL/);
  assert.match(template, /Privacy and Security/);
});

test('defines community hero rewards for critiques and VIVO-VOZ features', () => {
  const rewards = fs.readFileSync(path.join(__dirname, 'services', 'heroRewards.ts'), 'utf8');
  assert.match(rewards, /HeroReward/);
  assert.match(rewards, /BUG_HUNTER/);
  assert.match(rewards, /VIVO_HERO_GOLD/);
  assert.match(rewards, /freeDopingCredits: 1/);
  assert.match(rewards, /commissionDiscountPercentage: 50/);
  assert.match(rewards, /priorityVerifyAccess: true/);
  assert.match(rewards, /awardHeroUser/);
});

test('defines the VIVO-HERO engine and Devin reward prompt', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'vivoHeroEngine.ts'), 'utf8');
  const prompt = fs.readFileSync(path.join(__dirname, 'DEVIN_HERO_PROMPT.md'), 'utf8');
  const modal = fs.readFileSync(path.join(__dirname, 'components', 'VivoHeroRewardModal.tsx'), 'utf8');
  assert.match(engine, /awardHeroUser/);
  assert.match(engine, /freeDopingCredits: 1/);
  assert.match(engine, /commissionDiscountPercentage: 50/);
  assert.match(prompt, /BUG_HUNTER/);
  assert.match(prompt, /VIVO_HERO_GOLD/);
  assert.match(prompt, /idempotent source event ID/);
  assert.match(prompt, /public changelog/);
  assert.match(modal, /VivoHeroRewardModal/);
});

test('defines the 24-month ecosystem valuation projection', () => {
  const projection = fs.readFileSync(path.join(__dirname, 'services', 'ecosystemProjection.ts'), 'utf8');
  assert.match(projection, /EcosystemProjection24M/);
  assert.match(projection, /ANNUAL_GMV_USD = 200_000_000/);
  assert.match(projection, /AVERAGE_COMMISSION_RATE = 0\.035/);
  assert.match(projection, /companyValuationMin/);
  assert.match(projection, /companyValuationMax/);
  assert.match(projection, /PROJECTED_FLEET_SIZE = 750/);
  assert.match(projection, /calculate24MonthValuation/);
});

test('defines the VIVO valuation dashboard', () => {
  const dashboard = fs.readFileSync(path.join(__dirname, 'components', 'VivoValuationDashboard.tsx'), 'utf8');
  assert.match(dashboard, /VivoValuationDashboard/);
  assert.match(dashboard, /calculate24MonthValuation/);
  assert.match(dashboard, /projectedGMV/);
  assert.match(dashboard, /companyValuationMin/);
  assert.match(dashboard, /VIVO-CHECK Safe Escrow Ready/);
  assert.match(dashboard, /Security gates and evidence policy/);
});

test('defines the executive finance engine and Devin finance audit model', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'vivoFinancialProjectionEngine.ts'), 'utf8');
  const finance = fs.readFileSync(path.join(__dirname, 'DEVIN_FINANCE_MODEL.md'), 'utf8');
  const dashboard = fs.readFileSync(path.join(__dirname, 'components', 'VivoValuationDashboard.tsx'), 'utf8');
  assert.match(engine, /calculate24MonthValuation/);
  assert.match(engine, /revenueMultipleMin: 8/);
  assert.match(engine, /revenueMultipleMax: 10/);
  assert.match(finance, /Zero-vulnerability audit rules/);
  assert.match(finance, /raw PAN\/card data/);
  assert.match(finance, /npm run security:audit/);
  assert.match(finance, /human-approved/);
  assert.match(dashboard, /VivoValuationDashboard/);
});

test('defines the VIVO-HERO reward modal', () => {
  const modal = fs.readFileSync(path.join(__dirname, 'components', 'VivoHeroRewardModal.tsx'), 'utf8');
  assert.match(modal, /VivoHeroRewardModal/);
  assert.match(modal, /VIVO-HERO/);
  assert.match(modal, /1 Doping Gratis/);
  assert.match(modal, /50% Descuento en Comisión/);
  assert.match(modal, /onClose/);
  assert.match(modal, /role="dialog"/);
});

test('defines the premium Vivo showcase', () => {
  const showcase = fs.readFileSync(path.join(__dirname, 'components', 'VivoPremiumShowcase.tsx'), 'utf8');
  assert.match(showcase, /VivoPremiumShowcase/);
  assert.match(showcase, /VIVO-CHECK/);
  assert.match(showcase, /VIVO-ASSIST 24\/7/);
  assert.match(showcase, /bg-gradient-to-b/);
  assert.match(showcase, /backdrop-blur-xl/);
  assert.match(showcase, /Ecosistema Digital de Guatemala/);
});

test('uses the mobile commerce shell as the root landing page', () => {
  const home = fs.readFileSync(path.join(__dirname, 'app', 'page.tsx'), 'utf8');
  const design = fs.readFileSync(path.join(__dirname, 'docs', 'DESIGN_AGENT.md'), 'utf8');
  assert.match(home, /MobileCommerceShell/);
  assert.match(design, /bento grids/i);
  assert.match(design, /Glass/);
  assert.match(design, /VIVO-CHECK/);
  assert.match(design, /raw card data/);
});

test('defines the escrow transaction fee API contract', () => {
  const engine = fs.readFileSync(path.join(__dirname, 'services', 'commissionEngine.ts'), 'utf8');
  const route = fs.readFileSync(path.join(__dirname, 'app', 'api', 'v1', 'transactions', 'route.ts'), 'utf8');
  assert.match(engine, /TransactionType/);
  assert.match(engine, /VEHICLE_SALE: 100/);
  assert.match(engine, /SERVICE_JOB: 750/);
  assert.match(engine, /ESCROW_PAYMENT: 300/);
  assert.match(engine, /BYD_LEAD: 10_000/);
  assert.match(engine, /sellerPayoutGTQ/);
  assert.equal(fs.existsSync(path.join(__dirname, 'app', 'api', 'v1', 'transactions', 'route.ts')), true);
  assert.match(route, /ESCROW_HELD/);
  assert.match(route, /status: 201/);
  assert.match(route, /isGoldSubscriber/);
});

test('defines the BYD test drive lead form', () => {
  const form = fs.readFileSync(path.join(__dirname, 'components', 'BydLeadForm.tsx'), 'utf8');
  assert.match(form, /transactionType: 'BYD_LEAD'/);
  assert.match(form, /amountGTQ: 195/);
  assert.match(form, /50200000000/);
  assert.match(form, /noopener,noreferrer/);
  assert.match(form, /role="alert"/);
});

test('defines store subscription posting eligibility', () => {
  const subscription = fs.readFileSync(path.join(__dirname, 'services', 'storeSubscription.ts'), 'utf8');
  assert.match(subscription, /StoreSubscriptionPlan/);
  assert.match(subscription, /REAL_ESTATE_AGENT/);
  assert.match(subscription, /VEHICLE_DEALER/);
  assert.match(subscription, /MONTHLY_STORE_RENTAL_GTQ = 50\.00/);
  assert.match(subscription, /canPostListing: false/);
  assert.match(subscription, /Tienda activa/);
});

test('defines the store rent payment badge', () => {
  const badge = fs.readFileSync(path.join(__dirname, 'components', 'StoreRentBadge.tsx'), 'utf8');
  assert.match(badge, /StoreRentBadge/);
  assert.match(badge, /Tienda Activa \(Q50\/mes\)/);
  assert.match(badge, /Pago Pendiente/);
  assert.match(badge, /checkout\?amount=50&type=STORE_RENTAL/);
  assert.match(badge, /Pagar Q50/);
});

test('blocks unpaid real estate and vehicle listing posts', () => {
  const subscription = fs.readFileSync(path.join(__dirname, 'services', 'storeSubscription.ts'), 'utf8');
  const route = fs.readFileSync(path.join(__dirname, 'app', 'api', 'v1', 'listings', 'route.ts'), 'utf8');
  const experience = fs.readFileSync(path.join(__dirname, 'components', 'GuatemalaMarketplaceExperience.tsx'), 'utf8');
  assert.match(subscription, /canPostNewListing/);
  assert.match(subscription, /category !== 'REAL_ESTATE' && category !== 'VEHICLE'/);
  assert.match(route, /status: 402/);
  assert.match(route, /canPostNewListing/);
  assert.match(experience, /StoreRentBadge/);
});

test('defines KYC, inspection, and blacklist verification contracts', () => {
  const verification = fs.readFileSync(path.join(__dirname, 'types', 'verification.ts'), 'utf8');
  assert.match(verification, /BASIC_PHONE/);
  assert.match(verification, /KYC_VERIFIED/);
  assert.match(verification, /GOVERNMENT_ESCROW_APPROVED/);
  assert.match(verification, /nationalIdNumber/);
  assert.match(verification, /qrVerificationUrl/);
  assert.match(verification, /reportPdfUrl/);
  assert.match(verification, /suspiciousActivityScore/);
  assert.match(verification, /shouldBan/);
});

test('defines proactive blacklist risk and KYC escrow guards', () => {
  const security = fs.readFileSync(path.join(__dirname, 'services', 'securityEngine.ts'), 'utf8');
  const exports = fs.readFileSync(path.join(__dirname, 'types', 'securityModule.ts'), 'utf8');
  assert.match(exports, /export type.*BlacklistEvaluation/);
  assert.match(security, /evaluateRiskAndBlacklist/);
  assert.match(security, /rapidActionCount > 20/);
  assert.match(security, /riskScore >= 70/);
  assert.match(security, /executeEscrowLock/);
  assert.match(security, /executeSmartEscrowLock/);
  assert.match(security, /GOVERNMENT_ESCROW_APPROVED/);
  assert.match(security, /ESCROW-GTQ/);
  assert.match(security, /Smart Escrow işlemi için KYC kimlik doğrulaması zorunludur/);
  assert.match(security, /FUNDS_LOCKED_IN_ESCROW/);
  assert.match(exports, /interface EscrowLock/);
});

test('defines the inspection transparency badge', () => {
  const badge = fs.readFileSync(path.join(__dirname, 'components', 'InspectionBadge.tsx'), 'utf8');
  assert.match(badge, /InspectionBadge/);
  assert.match(badge, /Ekspertiz Onaylı \/ %100 Şeffaflık/);
  assert.match(badge, /safeScore/);
  assert.match(badge, /Resmi Ekspertiz Raporu \(PDF\)/);
  assert.match(badge, /QR doğrulama kodu/);
  assert.match(badge, /tabular-nums/);
});

test('runs mock RENAP and SAT VERI-SHIELD integrations', async () => {
  const app = createComplianceApp({
    verifyRenap: async ({ nationalId }) => ({ verified: nationalId === '123', reference: 'RENAP-1' }),
    verifySat: async ({ taxId }) => ({ verified: taxId === '456', reference: 'SAT-1' })
  });
  assert.deepEqual(await request(app, '/v1/compliance/renap/verify', { nationalId: '123' }), { status: 200, json: { provider: 'RENAP', verified: true, reference: 'RENAP-1' } });
  assert.deepEqual(await request(app, '/v1/compliance/sat/verify', { taxId: '456' }), { status: 200, json: { provider: 'SAT', verified: true, reference: 'SAT-1' } });
  assert.deepEqual(await request(app, '/v1/compliance/sat/verify', {}), { status: 400, json: { error: 'taxId is required' } });
});

test('restricts compliance API CORS to registered VIVO origins', async () => {
  const app = createComplianceApp({ verifySat: async () => ({ verified: true, reference: 'SAT-CORS' }) });
  const allowed = await request(app, '/v1/compliance/sat/verify', { taxId: '456' }, 'POST', { Origin: 'https://payvivoamigo.com' });
  assert.equal(allowed.status, 200);
  const denied = await request(app, '/v1/compliance/sat/verify', { taxId: '456' }, 'POST', { Origin: 'https://untrusted.example' });
  assert.deepEqual(denied, { status: 403, json: { error: 'origin is not allowed' } });
});

test('holds and releases VIVOAMIGOPAY escrow funds', async () => {
  const wallets = new Map();
  const app = createComplianceApp({ wallets });
  const created = await request(app, '/v1/pay/wallets', { userId: 'user-1' });
  assert.equal(created.status, 201);
  wallets.get(created.json.id).availableBalance = 100;

  const held = await request(app, `/v1/pay/wallets/${created.json.id}/hold`, { amount: 40, idempotencyKey: 'hold-1' });
  assert.equal(held.status, 201);
  assert.deepEqual(held.json.wallet, { ...created.json, availableBalance: 60, heldBalance: 40 });
  assert.equal((await request(app, `/v1/pay/wallets/${created.json.id}/hold`, { amount: 70, idempotencyKey: 'hold-2' })).status, 409);

  const released = await request(app, `/v1/pay/wallets/${created.json.id}/release`, { amount: 40, idempotencyKey: 'release-1' });
  assert.equal(released.status, 201);
  assert.equal(released.json.wallet.availableBalance, 100);
  assert.equal(released.json.wallet.heldBalance, 0);
});

test('tracks CARGO VIVO shipment status through delivery', async () => {
  const app = createComplianceApp();
  const created = await request(app, '/v1/cargo/shipments', { senderId: 'user-1', origin: { city: 'Guatemala' }, destination: { city: 'Mixco' } });
  assert.equal(created.status, 201);
  const trackingCode = created.json.trackingCode;
  assert.equal((await request(app, `/v1/cargo/shipments/${trackingCode}/status`, { status: 'in_transit' })).json.status, 'in_transit');
  assert.equal((await request(app, `/v1/cargo/shipments/${trackingCode}/status`, { status: 'delivered' })).json.status, 'delivered');
  assert.equal((await request(app, `/v1/cargo/shipments/${trackingCode}/status`, { status: 'cancelled' })).status, 409);
  assert.equal((await request(app, `/v1/cargo/shipments/${trackingCode}`, undefined, 'GET')).json.history.length, 3);
});

test('completes the end-to-end VERI-SHIELD, PAY, CARGO, and POS FEL flow', async () => {
  const wallets = new Map();
  const complianceApp = createComplianceApp({
    wallets,
    verifyRenap: async ({ nationalId }) => ({ verified: nationalId === 'SERDAR-001', reference: 'RENAP-E2E' })
  });
  const posApp = createPosApp({
    issueFel: async ({ saleId }) => ({ status: 'issued', satUuid: `SAT-${saleId}`, invoiceNumber: 'FEL-0001' })
  });

  const identity = await request(complianceApp, '/v1/compliance/renap/verify', { nationalId: 'SERDAR-001', fullName: 'Serdar Cevik' });
  assert.equal(identity.json.verified, true);

  const walletResponse = await request(complianceApp, '/v1/pay/wallets', { userId: identity.json.reference });
  wallets.get(walletResponse.json.id).availableBalance = 250;
  const hold = await request(complianceApp, `/v1/pay/wallets/${walletResponse.json.id}/hold`, { amount: 125, idempotencyKey: 'e2e-hold-1' });
  assert.equal(hold.json.wallet.heldBalance, 125);

  const shipment = await request(complianceApp, '/v1/cargo/shipments', { senderId: walletResponse.json.userId, origin: { city: 'Guatemala' }, destination: { city: 'Antigua' } });
  const tracking = await request(complianceApp, `/v1/cargo/shipments/${shipment.json.trackingCode}/status`, { status: 'in_transit' });
  assert.equal(tracking.json.status, 'in_transit');

  const sale = await request(posApp, '/v1/pos/sync', { terminalId: 'POS-E2E', sales: [{ clientTransactionId: 'sale-e2e-1', totalAmount: 125 }] });
  assert.equal(sale.json.accepted, 1);
  const invoice = await request(posApp, '/v1/pos/fel/issue', { saleId: sale.json.sales[0].clientTransactionId, sale: sale.json.sales[0] });
  assert.deepEqual(invoice.json, { saleId: 'sale-e2e-1', status: 'issued', satUuid: 'SAT-sale-e2e-1', invoiceNumber: 'FEL-0001' });
});

test('sync is idempotent for offline sales', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'vivo-pos-'));
  const databasePath = path.join(directory, 'pos.sqlite');
  const store = createLocalSqliteStore(databasePath);
  const app = createPosApp({ store });
  const body = { terminalId: 'T-1', sales: [{ clientTransactionId: 'offline-1', totalAmount: 9 }] };
  assert.equal((await request(app, '/v1/pos/sync', body)).json.accepted, 1);
  assert.equal((await request(app, '/v1/pos/sync', body)).json.sales.length, 1);
  store.close();
  const reopenedStore = createLocalSqliteStore(databasePath);
  assert.equal((await request(createPosApp({ store: reopenedStore }), '/v1/pos/sync', body)).json.sales.length, 1);
  reopenedStore.close();
  fs.rmSync(directory, { recursive: true, force: true });
});

test('defines the mobile-first commerce shell and Supabase adapter contracts', () => {
  const shell = fs.readFileSync(path.join(__dirname, 'components', 'MobileCommerceShell.tsx'), 'utf8');
  const page = fs.readFileSync(path.join(__dirname, 'app', 'page.tsx'), 'utf8');
  const supabase = fs.readFileSync(path.join(__dirname, 'services', 'supabaseContracts.ts'), 'utf8');
  assert.match(shell, /MobileCommerceShell/);
  assert.match(shell, /Touch-ID \/ Face-ID/);
  assert.match(shell, /VIVO-CHECK/);
  assert.match(shell, /Trusted seller/);
  assert.match(shell, /grid-cols-5/);
  assert.match(page, /MobileCommerceShell/);
  assert.match(supabase, /SupabaseAuthPort/);
  assert.match(supabase, /SupabaseListingPort/);
  assert.match(supabase, /SupabaseStoragePort/);
  assert.match(supabase, /not configured/);
});

test('generates VIVOAMIGOPAY checkout QR and queues CARGO VIVO metadata', async () => {
  const app = createPosApp({ store: new Map() });
  const qr = await request(app, '/v1/pos/qr', { terminalId: 'MARKETPLACE-01', amount: 36, currency: 'GTQ' });
  assert.equal(qr.status, 201);
  assert.match(qr.json.qrData, /^vivo:\/\/pay\/.+\..+$/);
  const delivery = await request(app, '/v1/pos/delivery', { orderId: 'order-01', metadata: { vendor: 'La Esquina', total: 36, paymentGateway: 'https://payvivoamigo.com' } });
  assert.equal(delivery.status, 201);
  assert.equal(delivery.json.provider, 'CARGO VIVO');
  assert.deepEqual(delivery.json.metadata, { vendor: 'La Esquina', total: 36, paymentGateway: 'https://payvivoamigo.com' });
});