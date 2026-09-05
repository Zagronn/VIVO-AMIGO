function createBiometricAuth(nativeBiometrics) {
  if (!nativeBiometrics || typeof nativeBiometrics.simplePrompt !== 'function') throw new Error('native biometric adapter is required');
  return {
    async unlock(promptMessage = 'Unlock VIVO AMIGO') {
      const result = await nativeBiometrics.simplePrompt({ promptMessage });
      return Boolean(result.success);
    }
  };
}

module.exports = { createBiometricAuth };
