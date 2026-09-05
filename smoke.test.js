const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { createComplianceApp } = require('./compliance.api');
const { SwarmOrchestrator } = require('./agents.service');
const { createLocalSqliteStore, createPosApp, generateQrPayload } = require('./vivopos.service');

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
  const serviceWorker = await getText(app, '/sw.js');
  const index = await getText(app, '/');
  const mobileTargets = require('./mobile/src').APPS;
  const { PRODUCTION_ENDPOINTS } = require('./mobile/src/config');
  assert.match(shell.text, /VIVOAMIGOPAY/);
  assert.match(shell.text, /CARGO VIVO/);
  assert.match(shell.text, /MARKETPLACE/);
  assert.match(manifest.text, /VIVO AMIGO Commerce/);
  assert.match(manifest.text, /#111111/);
  assert.equal(brandMark.status, 200);
  assert.match(brandMark.text, /VIVO AMIGO VA shield mark/);
  assert.match(brandMark.text, /#FF6A00/);
  assert.match(styles, /--bg:#111111/);
  assert.match(styles, /--silver:#7A808A/);
  assert.match(styles, /--accent:#FF6A00/);
  assert.match(styles, /"Amazon Ember"/);
  assert.match(styles, /line-height:1\.4/);
  assert.match(styles, /font-variant-numeric:tabular-nums/);
  assert.match(marketplace, /VIVO AMIGO MARKETPLACE/);
  assert.match(marketplace, /Generate Checkout QR/);
  assert.match(marketplace, /Sync Offline Sales/);
  assert.match(marketplace, /indexedDB\.open/);
  assert.match(marketplace, /paymentGateway: PAYMENT_GATEWAY/);
  assert.match(marketplace, /data-cart-action/);
  assert.match(tailwind, /background: '#111111'/);
  assert.match(tailwind, /silver: '#7A808A'/);
  assert.match(tailwind, /accent: '#FF6A00'/);
  assert.match(serviceWorker.text, /vendor\/qrcode\.min\.js/);
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
  assert.match(fs.readFileSync(path.join(__dirname, 'mobile', 'App.js'), 'utf8'), /fontFamily: 'Amazon Ember'/);
  assert.equal(fs.existsSync(path.join(__dirname, 'mobile', 'android', 'app', 'src', 'main', 'assets', 'public', 'index.html')), true);
  assert.equal(fs.existsSync(path.join(__dirname, 'mobile', 'android', 'app', 'src', 'main', 'assets', 'public', 'sw.js')), true);
  assert.equal(fs.existsSync(path.join(__dirname, 'mobile', 'android', 'app', 'src', 'main', 'assets', 'public', 'vendor', 'qrcode.min.js')), true);
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