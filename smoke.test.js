const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { createComplianceApp } = require('./compliance.api');
const { createLocalSqliteStore, createPosApp, generateQrPayload } = require('./vivopos.service');

async function request(app, path, body, method = 'POST') {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}${path}`;
  const options = { method, headers: { 'content-type': 'application/json' } };
  if (body !== undefined) options.body = JSON.stringify(body);
  const response = await fetch(url, options);
  const json = await response.json();
  await new Promise((resolve) => server.close(resolve));
  return { status: response.status, json };
}

test('generates a signed, expiring QR payload', () => {
  const qr = generateQrPayload({ terminalId: 'T-1', amount: 12.5 }, 'test-secret');
  assert.match(qr.qrData, /^vivo:\/\/pay\/.+\..+$/);
  assert.ok(qr.expiresAt > Date.now());
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

test('holds and releases PAY VIVO escrow funds', async () => {
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