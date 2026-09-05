function createQrScanner({ onScan, onError } = {}) {
  if (typeof onScan !== 'function') throw new Error('onScan callback is required');
  return {
    onCodeDetected(code) {
      if (typeof code !== 'string' || code.trim() === '') return onError?.(new Error('empty QR code'));
      return onScan(code.trim());
    }
  };
}

module.exports = { createQrScanner };
