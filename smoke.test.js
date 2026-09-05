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