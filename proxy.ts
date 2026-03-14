import { type NextRequest, NextResponse } from 'next/server';
import { rootDomain } from '@/lib/utils';
import { debug, error, info } from './lib/log';

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Local development environment
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0];
    }

    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(':')[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted && hostname !== `www.${rootDomainFormatted}` && hostname.endsWith(`.${rootDomainFormatted}`);

  error('[middleware] isSubdomain:', isSubdomain);
  error('[middleware] rootDomainFormatted:', rootDomainFormatted);
  error('[middleware] hostname:', hostname);
  error('[middleware] endsWith check:', hostname.endsWith(`.${rootDomainFormatted}`));

  error('[🔥DEBUG] extractSubdomain', {
    url: request.url,
    host: request.headers.get('host'),
    rootDomain,
    rootDomainFormatted: rootDomain.split(':')[0],
    hostname,
    isSubdomainCheck: {
      notEqual: hostname !== rootDomain.split(':')[0],
      notWww: hostname !== `www.${rootDomain.split(':')[0]}`,
      endsWith: hostname.endsWith(`.${rootDomain.split(':')[0]}`)
    }
  });

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  try {
    // lightweight logging — enabled by DEBUG_LOG env var in `lib/log.ts`
    // import dynamic to avoid circular imports in middleware
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { info } = require('./lib/log');
    info('middleware', { pathname, subdomain, host: request.headers.get('host') });
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
