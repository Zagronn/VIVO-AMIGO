function createOfflineQueue({ storage, key }) {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') throw new Error('storage adapter is required');
  async function read() {
    try { return JSON.parse((await storage.getItem(key)) || '[]'); } catch { return []; }
  }
  return {
    async enqueue(item) {
      const queue = await read();
      queue.push({ ...item, queuedAt: item.queuedAt || new Date().toISOString() });
      await storage.setItem(key, JSON.stringify(queue));
      return queue;
    },
    async pending() { return read(); },
    async replace(items) { await storage.setItem(key, JSON.stringify(items)); }
  };
}

module.exports = { createOfflineQueue };
