export interface DataPrivacyConsent {
  userId: string;
  acceptedPrivacyTerms: boolean;
  acceptedDataMonetizationConsent: boolean;
  timestamp: string;
}

export function validatePrivacyShield(consent: DataPrivacyConsent): boolean {
  return Boolean(
    consent.userId.trim() &&
    consent.acceptedPrivacyTerms &&
    consent.acceptedDataMonetizationConsent &&
    Number.isFinite(new Date(consent.timestamp).getTime())
  );
}

export function maskSensitiveUserData(phoneNumber: string, email: string): { maskedPhone: string; maskedEmail: string } {
  const digits = phoneNumber.replace(/\D/g, '');
  const maskedPhone = digits.length >= 8 ? `${digits.slice(0, 3)}***${digits.slice(-2)}` : '***';
  const [name = '', domain = ''] = email.trim().split('@');
  const maskedEmail = name.length >= 2 && domain ? `${name.slice(0, 2)}***@${domain}` : '***@***';
  return { maskedPhone, maskedEmail };
}
