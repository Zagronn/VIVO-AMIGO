import { NextResponse } from 'next/server';
import { canPostNewListing, type ListingCategory, type StoreSubscriptionPlan } from '../../../../services/storeSubscription';

export async function POST(request: Request) {
  const body = await request.json() as { category?: ListingCategory; subscription?: StoreSubscriptionPlan; title?: string };
  const category = body.category || 'GENERAL';
  const subscription = body.subscription;
  if (!body.title || !subscription) return NextResponse.json({ error: 'title and subscription are required' }, { status: 400 });

  const eligibility = canPostNewListing(category, subscription);
  if (!eligibility.canPostListing) return NextResponse.json({ error: eligibility.statusMessage }, { status: 402 });

  return NextResponse.json({ accepted: true, title: body.title, category }, { status: 201 });
}