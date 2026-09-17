const { endpoint } = require('./config');

const APPS = {
  pay: {
    id: 'vivoamigopay',
    name: 'VIVOAMIGOPAY',
    apiOrigin: endpoint('payment'),
    flows: ['wallet', 'escrow', 'biometric-unlock']
  },
  cargo: {
    id: 'cargo-vivo',
    name: 'CARGO VIVO',
    apiOrigin: endpoint('cargo'),
    flows: ['shipment-create', 'live-tracking', 'proof-of-delivery']
  },
  pos: {
    id: 'vivo-pos',
    name: 'VIVO POS',
    apiOrigin: endpoint('pos'),
    flows: ['catalog', 'qr-checkout', 'offline-sync', 'fel-invoice']
  }
};

function getApp(appKey) {
  const app = APPS[appKey];
  if (!app) throw new Error(`Unknown VIVO app: ${appKey}`);
  return app;
}

module.exports = { APPS, getApp };
