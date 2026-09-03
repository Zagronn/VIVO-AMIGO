const QUEUE_KEY = 'vivo-pos-offline-sales';
const TERMINAL_ID = 'POS-01';
const state = { queue: loadQueue(), selectedSale: null };
const $ = (selector) => document.querySelector(selector);

function loadQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
}

function saveQueue() { localStorage.setItem(QUEUE_KEY, JSON.stringify(state.queue)); renderQueue(); }

function renderQueue() {
  $('#queueCount').textContent = state.queue.length;
  $('#syncButton').disabled = !state.queue.length || !navigator.onLine;
  $('#queueList').innerHTML = state.queue.length ? state.queue.map((sale) => `<div class="sale-row ${state.selectedSale?.clientTransactionId === sale.clientTransactionId ? 'selected' : ''}"><button data-sale="${sale.clientTransactionId}"><strong>Q${Number(sale.totalAmount).toFixed(2)}</strong><small>${sale.clientTransactionId} · ${sale.status || 'queued'}</small></button></div>`).join('') : '<div class="empty-state">No pending sales.<br>Completed sales appear here when offline.</div>';
  document.querySelectorAll('[data-sale]').forEach((button) => button.addEventListener('click', () => { state.selectedSale = state.queue.find((sale) => sale.clientTransactionId === button.dataset.sale); $('#invoiceButton').disabled = !state.selectedSale; renderQueue(); }));
}

function updateConnection() {
  const online = navigator.onLine;
  $('#connectionStatus').classList.toggle('offline', !online);
  $('#connectionStatus').innerHTML = `<span></span> ${online ? 'Online' : 'Offline'}`;
  $('#syncButton').disabled = !state.queue.length || !online;
}

async function post(url, body) {
  const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Request failed');
  return payload;
}

async function renderQr(payload) {
  const encoded = payload.qrData.split('/').pop().split('.')[0];
  $('#qrStage').innerHTML = '<div class="qr-code"><canvas aria-label="Payment QR code"></canvas></div>';
  await QRCode.toCanvas($('#qrStage canvas'), payload.qrData, { width: 204, margin: 1, color: { dark: '#102a2a', light: '#ffffff' } });
  $('#qrMeta').hidden = false;
  $('#qrAmount').textContent = `Q${payload.amount.toFixed(2)} ${payload.currency}`;
  $('#qrExpiry').textContent = `Valid until ${new Date(payload.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  $('#qrStage').dataset.payload = encoded;
}

async function generateQr(event) {
  event.preventDefault();
  const amount = Number($('#amount').value);
  if (!amount) return;
  try { await renderQr(await post('/v1/pos/qr', { terminalId: TERMINAL_ID, amount })); }
  catch (error) { $('#syncNote').textContent = `QR unavailable: ${error.message}`; }
}

function queueSale() {
  const amount = Number($('#amount').value);
  if (!amount) return;
  state.queue.push({ clientTransactionId: crypto.randomUUID(), totalAmount: Number(amount.toFixed(2)), soldAt: new Date().toISOString(), status: 'queued' });
  state.selectedSale = state.queue[state.queue.length - 1];
  saveQueue();
  $('#syncNote').textContent = navigator.onLine ? 'Sale saved. Syncing now.' : 'Sale saved locally. It will sync when online.';
  syncQueue();
}

async function syncQueue() {
  if (!state.queue.length || !navigator.onLine) return;
  try {
    const result = await post('/v1/pos/sync', { terminalId: TERMINAL_ID, sales: state.queue });
    state.queue = result.sales.map((sale) => ({ ...sale, status: 'synced' }));
    saveQueue();
    $('#syncNote').textContent = `${result.accepted} sale${result.accepted === 1 ? '' : 's'} synced. Select one to issue FEL.`;
  } catch (error) { $('#syncNote').textContent = `Sync paused: ${error.message}`; }
}

async function issueInvoice() {
  if (!state.selectedSale) return;
  try {
    const invoice = await post('/v1/pos/fel/issue', { saleId: state.selectedSale.clientTransactionId, sale: state.selectedSale });
    $('#felStatus').textContent = `${invoice.invoiceNumber} issued · ${invoice.satUuid}`;
  } catch (error) { $('#felStatus').textContent = `FEL unavailable: ${error.message}`; }
}

$('#paymentForm').addEventListener('submit', generateQr);
$('#queueSaleButton').addEventListener('click', queueSale);
$('#syncButton').addEventListener('click', syncQueue);
$('#invoiceButton').addEventListener('click', issueInvoice);
window.addEventListener('online', () => { updateConnection(); syncQueue(); });
window.addEventListener('offline', updateConnection);
renderQueue();
updateConnection();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');