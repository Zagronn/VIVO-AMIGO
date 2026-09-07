import { NextResponse } from 'next/server';
import { BancoIndustrialBridge, type BICreditApplication } from '../../../../../../../services/bancoIndustrialBridge';

export async function POST(request: Request) {
  try {
    const application = await request.json() as BICreditApplication;
    const result = await new BancoIndustrialBridge().processInstantLoan(application);
    return NextResponse.json(result, { status: result.status === 'PRE_APPROVED' ? 200 : 202 });
  } catch {
    return NextResponse.json({ status: 'REJECTED_OR_MANUAL_REVIEW', message: 'La solicitud requiere revisión manual del socio financiero.' }, { status: 202 });
  }
}