import { NextResponse } from 'next/server';
import { VivoMercadoEngine, type B2BImportExportDeal } from '../../../services/vivoMercadoEngine';

interface EscrowRequest extends B2BImportExportDeal {
  securityLockActive?: boolean;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<EscrowRequest>;
    const deal: B2BImportExportDeal = {
      dealId: typeof body.dealId === 'string' ? body.dealId : '',
      supplierCountry: body.supplierCountry as B2BImportExportDeal['supplierCountry'],
      buyerCountry: body.buyerCountry as 'GT',
      escrowAmountUSD: Number(body.escrowAmountUSD),
      currency: body.currency as B2BImportExportDeal['currency'],
      veriShieldApproved: body.veriShieldApproved === true,
      status: body.status as B2BImportExportDeal['status']
    };
    if (body.securityLockActive === true) return NextResponse.json({ status: 'MANUAL_REVIEW', message: 'Iron Shield security lock is active; escrow requires review.' }, { status: 423 });
    const result = new VivoMercadoEngine().initializeCrossBorderEscrow(deal);
    return NextResponse.json({ status: 'ESCROW_INITIALIZED', paymentDomain: 'payvivoamigo.com', cargoReleaseCondition: result.releaseCondition, escrow: result }, { status: 201 });
  } catch {
    return NextResponse.json({ status: 'MANUAL_REVIEW', message: 'Escrow requires supplier, corridor, currency, and VERI-SHIELD review.' }, { status: 202 });
  }
}