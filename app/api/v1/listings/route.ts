import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { canPostNewListing, type ListingCategory, type StoreSubscriptionPlan } from '../../../../services/storeSubscription';
import { processInvisibleVehicleFilter, type VehicleVerificationInput } from '../../../../services/invisibleVehicleFilter';
import { dispatchVivoVerifyMobileInspector } from '../../../../services/vivoVerifyDispatch';

export async function POST(request: Request) {
  const body = await request.json() as Partial<VehicleVerificationInput> & { category?: ListingCategory; subscription?: StoreSubscriptionPlan; title?: string; priceGTQ?: number };
  const category = body.category || 'GENERAL';
  const subscription = body.subscription;
  if (!body.title || !subscription) return NextResponse.json({ error: 'title and subscription are required' }, { status: 400 });

  const eligibility = canPostNewListing(category, subscription);
  if (!eligibility.canPostListing) return NextResponse.json({ error: eligibility.statusMessage }, { status: 402 });

  const requiresInvisibleBarrier = category === 'VEHICLE' || (typeof body.priceGTQ === 'number' && body.priceGTQ >= 50_000);
  if (requiresInvisibleBarrier) {
    const verification = await processInvisibleVehicleFilter({
      vinNumber: body.vinNumber || '',
      licensePlate: body.licensePlate || '',
      registrationDocumentImage: body.registrationDocumentImage || '',
      ownerDPI: body.ownerDPI || ''
    });
    if (!verification.isVerified) {
      return NextResponse.json({
        accepted: false,
        status: 'DOCUMENT_REVIEW_REQUIRED',
        message: 'Por favor revisa y vuelve a cargar los documentos del vehículo para continuar.'
      }, { status: 202 });
    }

    const dispatch = await dispatchVivoVerifyMobileInspector({
      listingId: `LISTING-${randomUUID()}`,
      vehicle: { vinNumber: body.vinNumber || '', licensePlate: body.licensePlate || '' }
    });
    return NextResponse.json({ accepted: true, title: body.title, category, verification: 'VIVO_VERIFY_DIGITAL', inspectorDispatch: dispatch }, { status: 201 });
  }

  return NextResponse.json({ accepted: true, title: body.title, category }, { status: 201 });
}