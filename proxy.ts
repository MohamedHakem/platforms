import { type NextRequest, NextResponse } from 'next/server';
import { extractSubdomain } from './lib/extractSubdomain';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.url;
  const subdomain = extractSubdomain(request);

  try {
    // lightweight logging — enabled by DEBUG_LOG env var in `lib/log.ts`
    // import dynamic to avoid circular imports in middleware
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { info } = require('./lib/log');
    info('[middleware]', { url, pathname, subdomain, host: request.headers.get('host') });
  } catch (e) {
    // ignore logging failures
  }

  if (subdomain) {
    // Block access to admin page from subdomains
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // For the root path on a subdomain, rewrite to the subdomain page
    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/s/${subdomain}`, request.url));
    }
  }

  // On the root domain, allow normal access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|[\\w-]+\\.\\w+).*)'
  ]
};
