import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Multi-domain routing for the VIVO AMIGO ecosystem, all served from this one
 * Next.js deployment:
 *
 *  - vivoamigo.com        -> the full site, unchanged (marketplace + classifieds + ecosystem)
 *  - payvivoamigo.com     -> rewritten to /pay (the VIVO PAY sub-brand page)
 *  - cargovivo.com        -> rewritten to /ship (the VIVO SHIP / logistics sub-brand page)
 *
 * Only the root path ("/") is rewritten for the sub-brand domains, so a link
 * like payvivoamigo.com/contact still resolves to the real /contact page
 * instead of being forced back to /pay.
 */

const DOMAIN_ROOT_REWRITES: Record<string, string> = {
  'payvivoamigo.com': '/pay',
  'www.payvivoamigo.com': '/pay',
  'cargovivo.com': '/ship',
  'www.cargovivo.com': '/ship',
};

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase();
  const { pathname } = request.nextUrl;

  if (host && pathname === '/' && DOMAIN_ROOT_REWRITES[host]) {
    const url = request.nextUrl.clone();
    url.pathname = DOMAIN_ROOT_REWRITES[host];
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets, images, and Next internals — no need to run the
  // rewrite check on requests that can never be a bare "/" page load anyway.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
