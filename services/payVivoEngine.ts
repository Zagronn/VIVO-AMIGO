import { randomUUID } from 'node:crypto';

export interface UserMigrationPayload {
  externalId: string;
  sourcePartner: 'BANCO_INDUSTRIAL' | 'BANRURAL' | 'TIGO' | 'CLARO';
  userDigitalIdentity: string;
  veriShieldVerificationHash: string;
}

export interface VivoPayWallet {
  walletId: string;
  userId: string;
  balanceGTQ: number;
  reputationScore: number;
  isCommissionFreeTier: boolean;
}

export interface TransferResult {
  success: true;
  amountGTQ: number;
  timestamp: string;
}

function required(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${field} is required`);
  return value.trim();
}

export class PayVivoEngine {
  private readonly walletLedger = new Map<string, VivoPayWallet>();
  private readonly identities = new Set<string>();

  public processPartnerMigration(payload: UserMigrationPayload): VivoPayWallet {
    const externalId = required(payload.externalId, 'externalId');
    const digitalIdentity = required(payload.userDigitalIdentity, 'userDigitalIdentity');
    const verificationHash = required(payload.veriShieldVerificationHash, 'veriShieldVerificationHash');
    if (!['BANCO_INDUSTRIAL', 'BANRURAL', 'TIGO', 'CLARO'].includes(payload.sourcePartner)) throw new Error('sourcePartner is not supported');
    if (this.identities.has(digitalIdentity)) throw new Error('Digital Trade ID has already been migrated');

    const wallet: VivoPayWallet = {
      walletId: `VIVO-PAY-${randomUUID()}`,
      userId: `partner:${payload.sourcePartner}:${externalId}`,
      balanceGTQ: 0,
      reputationScore: 100,
      isCommissionFreeTier: true
    };
    this.identities.add(digitalIdentity);
    this.walletLedger.set(wallet.walletId, wallet);
    void verificationHash;
    return { ...wallet };
  }

  public getWallet(walletId: string): VivoPayWallet | undefined {
    const wallet = this.walletLedger.get(walletId);
    return wallet ? { ...wallet } : undefined;
  }

  public executeDirectTransfer(senderWalletId: string, receiverWalletId: string, amountGTQ: number): TransferResult {
    required(senderWalletId, 'senderWalletId');
    required(receiverWalletId, 'receiverWalletId');
    if (senderWalletId === receiverWalletId) throw new Error('sender and receiver wallets must differ');
    if (!Number.isFinite(amountGTQ) || amountGTQ <= 0) throw new Error('amountGTQ must be greater than zero');
    const sender = this.walletLedger.get(senderWalletId);
    const receiver = this.walletLedger.get(receiverWalletId);
    if (!sender || !receiver || sender.balanceGTQ < amountGTQ) throw new Error('payvivoamigo: insufficient balance or invalid wallet identity');
    sender.balanceGTQ = Number((sender.balanceGTQ - amountGTQ).toFixed(2));
    receiver.balanceGTQ = Number((receiver.balanceGTQ + amountGTQ).toFixed(2));
    return { success: true, amountGTQ: Number(amountGTQ.toFixed(2)), timestamp: new Date().toISOString() };
  }
}