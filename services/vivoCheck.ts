export type VivoCheckStatus = 'PENDING_MATCH' | 'VERIFIED_ON_SITE' | 'COMPLETED_ESCROW_RELEASED' | 'DISPUTED_BAN';

export interface VivoCheckSession {
  checkCode: string;
  listingId: string;
  buyerUserId: string;
  sellerUserId: string;
  status: VivoCheckStatus;
  holdAmountGTQ: number;
  createdAt: string;
}

export function generateVivoCheckCode(listingId: string, buyerUserId: string, listingPriceGTQ: number): VivoCheckSession {
  if (!listingId.trim() || !buyerUserId.trim()) throw new Error('listingId and buyerUserId are required');
  if (!Number.isFinite(listingPriceGTQ) || listingPriceGTQ <= 0) throw new Error('listingPriceGTQ must be greater than zero');

  const random4Digit = Math.floor(1000 + Math.random() * 9000);
  return {
    checkCode: `VIVO-${random4Digit}-GT`,
    listingId,
    buyerUserId,
    sellerUserId: '',
    status: 'PENDING_MATCH',
    holdAmountGTQ: Number((listingPriceGTQ * 0.01).toFixed(2)),
    createdAt: new Date().toISOString()
  };
}

export function verifyAndLockVivoCheck(checkCode: string, sellerUserId: string, session: VivoCheckSession): VivoCheckSession {
  if (!checkCode.trim() || session.checkCode !== checkCode) throw new Error('Código VIVO-CHECK inválido.');
  if (!sellerUserId.trim()) throw new Error('sellerUserId is required');
  if (session.status !== 'PENDING_MATCH') throw new Error('VIVO-CHECK session is not pending match.');

  return { ...session, sellerUserId, status: 'VERIFIED_ON_SITE' };
}
