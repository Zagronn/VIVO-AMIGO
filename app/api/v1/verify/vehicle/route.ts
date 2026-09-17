import { NextResponse } from 'next/server';
import { processInvisibleVehicleFilter } from '../../../../../services/vivoVerifyEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const verification = await processInvisibleVehicleFilter({
      vinNumber: typeof body.vinNumber === 'string' ? body.vinNumber : '',
      licensePlate: typeof body.licensePlate === 'string' ? body.licensePlate : '',
      registrationDocumentImage: typeof body.registrationDocumentImage === 'string' ? body.registrationDocumentImage : '',
      ownerDPI: typeof body.ownerDPI === 'string' ? body.ownerDPI : ''
    });
    if (!verification.isVerified) return NextResponse.json({ verified: false, message: 'No pudimos validar los documentos. Por favor revisa la información e inténtalo de nuevo.' }, { status: 202 });
    return NextResponse.json({ verified: true, verification: 'VIVO_VERIFY_DIGITAL' }, { status: 200 });
  } catch {
    return NextResponse.json({ verified: false, message: 'No pudimos validar los documentos. Por favor solicita una revisión.' }, { status: 202 });
  }
}