import { NextResponse } from 'next/server';
import { calculateVivoAmigoFee, type TransactionType } from '../../../../services/commissionEngine';

const TRANSACTION_TYPES = new Set<TransactionType>(['VEHICLE_SALE', 'REAL_ESTATE_SALE', 'SERVICE_JOB', 'WHOLESALE', 'ESCROW_PAYMENT', 'BYD_LEAD']);

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const amountGTQ = Number(body.amountGTQ);
    const transactionType = typeof body.transactionType === 'string' ? body.transactionType : '';

    if (!Number.isFinite(amountGTQ) || amountGTQ <= 0 || !TRANSACTION_TYPES.has(transactionType as TransactionType)) {
      return NextResponse.json({ error: 'amountGTQ and a supported transactionType are required' }, { status: 400 });
    }

    const feeSummary = calculateVivoAmigoFee({
      type: transactionType as TransactionType,
      amountGTQ,
      isGoldSubscriber: body.isGoldSubscriber === true
    });
    const transaction = {
      id: `TRX-${crypto.randomUUID()}`,
      sellerId: typeof body.sellerId === 'string' ? body.sellerId : null,
      buyerId: typeof body.buyerId === 'string' ? body.buyerId : null,
      grossAmountGTQ: feeSummary.grossAmountGTQ,
      netPlatformFeeGTQ: feeSummary.platformFeeGTQ,
      netSellerPayoutGTQ: feeSummary.sellerPayoutGTQ,
      status: 'ESCROW_HELD',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({ success: true, transaction, feeSummary }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to process transaction' }, { status: 500 });
  }
}
