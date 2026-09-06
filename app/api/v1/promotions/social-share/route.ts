import { NextResponse } from 'next/server';
import { processSocialShareVerification, type SocialVerifyPayload } from '../../../../../services/socialShareVerification';

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Partial<SocialVerifyPayload>;
    const response = await processSocialShareVerification({
      userId: typeof payload.userId === 'string' ? payload.userId : '',
      platform: payload.platform as SocialVerifyPayload['platform'],
      sharedLinkOrScreenshotUrl: typeof payload.sharedLinkOrScreenshotUrl === 'string' ? payload.sharedLinkOrScreenshotUrl : ''
    });
    return NextResponse.json(response, { status: response.success ? 200 : 202 });
  } catch {
    return NextResponse.json({ success: false, commissionRate: 0.035, freeDopingCreditsGranted: 0, message: 'No pudimos verificar el enlace. Por favor inténtalo de nuevo más tarde.' }, { status: 202 });
  }
}