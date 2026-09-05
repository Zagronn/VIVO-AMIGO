const crypto = require('node:crypto');
const path = require('node:path');
const express = require('express');

function createLocalSqliteStore(filename = process.env.VIVO_POS_SQLITE_PATH || ':memory:') {
  try {
    const { DatabaseSync } = require('node:sqlite');
    const database = new DatabaseSync(filename);
    database.exec('CREATE TABLE IF NOT EXISTS offline_sales (store_key TEXT PRIMARY KEY, sale_json TEXT NOT NULL)');
    const read = database.prepare('SELECT sale_json FROM offline_sales WHERE store_key = ?');
    const write = database.prepare('INSERT OR IGNORE INTO offline_sales (store_key, sale_json) VALUES (?, ?)');
    return {
      has: (key) => read.get(key) !== undefined,
      get: (key) => {
        const row = read.get(key);
        return row ? JSON.parse(row.sale_json) : undefined;
      },
      set: (key, value) => write.run(key, JSON.stringify(value)),
      close: () => database.close()
    };
  } catch (error) {
    if (error.code !== 'ERR_UNKNOWN_BUILTIN_MODULE') throw error;
    const memory = new Map();
    return { has: (key) => memory.has(key), get: (key) => memory.get(key), set: (key, value) => memory.set(key, value), close: () => {} };
  }
}

function assertString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') throw Object.assign(new Error(`${field} is required`), { statusCode: 400 });
  return value.trim();
}

function assertAmount(value) {
  if (!Number.isFinite(value) || value <= 0) throw Object.assign(new Error('amount must be greater than zero'), { statusCode: 400 });
  return Number(value.toFixed(2));
}

function generateQrPayload({ terminalId, amount, currency = 'GTQ', expiresInSeconds = 300 }, secret) {
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  const payload = { terminalId: assertString(terminalId, 'terminalId'), amount: assertAmount(amount), currency, expiresAt, nonce: crypto.randomUUID() };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return { ...payload, qrData: `vivo://pay/${encoded}.${signature}` };
}

function createPosApp({ secret = process.env.VIVO_POS_QR_SECRET || 'local-development-secret', store = createLocalSqliteStore(), issueFel = async () => ({ status: 'queued' }) } = {}) {
  const app = express();
  app.use(express.json({ limit: '256kb' }));
  app.use('/vendor', express.static(path.join(__dirname, 'node_modules/qrcode/build')));
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/health', (_request, response) => response.json({ service: 'vivo-pos', status: 'ok' }));
  app.use((request, response, next) => {
    if (request.method === 'GET' && !request.path.startsWith('/v1/')) return response.sendFile(path.join(__dirname, 'public', 'index.html'));
    return next();
  });

  app.post('/v1/pos/qr', (request, response, next) => {
    try {
      response.status(201).json(generateQrPayload(request.body || {}, secret));
    } catch (error) {
      next(error);
    }
  });

  app.post('/v1/pos/sync', async (request, response, next) => {
    try {
      const terminalId = assertString(request.body?.terminalId, 'terminalId');
      const sales = request.body?.sales;
      if (!Array.isArray(sales)) throw Object.assign(new Error('sales must be an array'), { statusCode: 400 });
      const synced = [];
      for (const sale of sales) {
        const clientTransactionId = assertString(sale.clientTransactionId, 'clientTransactionId');
        const key = `${terminalId}:${clientTransactionId}`;
        if (!store.has(key)) store.set(key, { ...sale, terminalId, status: 'synced' });
        synced.push(store.get(key));
      }
      response.json({ accepted: synced.length, sales: synced });
    } catch (error) {
      next(error);
    }
  });

  app.post('/v1/pos/fel/issue', async (request, response, next) => {
    try {
      const saleId = assertString(request.body?.saleId, 'saleId');
      const result = await issueFel({ saleId, sale: request.body.sale });
      response.status(202).json({ saleId, ...result });
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _request, response, _next) => response.status(error.statusCode || 502).json({ error: error.message || 'VIVO POS request failed' }));
  return app;
}

module.exports = { createLocalSqliteStore, createPosApp, generateQrPayload };

if (require.main === module) createPosApp().listen(process.env.PORT || 3002, () => console.log('VIVO POS service listening'));