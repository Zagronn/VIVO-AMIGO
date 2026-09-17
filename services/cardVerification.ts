import { randomUUID } from 'node:crypto';

export interface CardVerificationRequest {
  userId: string;
  cardHolderName: string;
  dpiMatchName: string;
  cardNumberToken: string;
  expiryDate: string;
}

export interface SecurityEvaluationResult {
  isVerified: boolean;
  statusMessage: string;
  tokenizedCardId: string;
}

function normalizeName(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function validExpiry(expiryDate: string): boolean {
  const match = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.exec(expiryDate.trim());
  if (!match) return false;
  const year = Number(match[2].length === 2 ? `20${match[2]}` : match[2]);
  const expiry = new Date(Date.UTC(year, Number(match[1]), 0, 23, 59, 59));
  return expiry.getTime() >= Date.now();
}

export function verifyUserCardAndIdentity(req: CardVerificationRequest): SecurityEvaluationResult {
  if (!req.userId.trim() || !req.cardHolderName.trim() || !req.dpiMatchName.trim()) {
    return { isVerified: false, statusMessage: 'Los datos de identidad son obligatorios.', tokenizedCardId: '' };
  }

  if (normalizeName(req.cardHolderName) !== normalizeName(req.dpiMatchName)) {
    return { isVerified: false, statusMessage: 'El nombre de la tarjeta no coincide con el documento oficial DPI.', tokenizedCardId: '' };
  }

  if (!req.cardNumberToken.trim() || /\d{12,19}/.test(req.cardNumberToken)) {
    return { isVerified: false, statusMessage: 'Se requiere un token de tarjeta válido; nunca envíe el número de tarjeta.', tokenizedCardId: '' };
  }

  if (!validExpiry(req.expiryDate)) {
    return { isVerified: false, statusMessage: 'La fecha de expiración de la tarjeta no es válida.', tokenizedCardId: '' };
  }

  // 3DS/temporary authorization must be performed by the Visanet/NeoNet adapter before this function is called.
  return {
    isVerified: true,
    statusMessage: 'Tarjeta verificada con éxito. Usuario habilitado para operar.',
    tokenizedCardId: `TOKEN-${randomUUID()}`
  };
}
