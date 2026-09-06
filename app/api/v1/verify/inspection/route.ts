import { NextResponse } from 'next/server';
import { bookVipInspection } from '../../../../../services/vivoVerifyEngine';

export async function POST(request: Request) {
  try {
    const booking = await bookVipInspection(await request.json());
    return NextResponse.json({ booked: true, booking }, { status: 201 });
  } catch {
    return NextResponse.json({ booked: false, message: 'No pudimos reservar la inspección VIP. Revisa la fecha e inténtalo de nuevo.' }, { status: 400 });
  }
}