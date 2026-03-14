import { rootDomain } from '@/lib/utils';
import { type NextRequest } from 'next/server';
import { info } from './log';
import { getTrueUrl } from './getTrueUrl';

export function extractSubdomain(request: NextRequest): string | null {
  // Get the true URL first
  const trueUrl = getTrueUrl(request);
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  info('[extractSubdomain]', {
    trueUrl,
    originalUrl: request.url,
    host,
    hostname
  });

  // Detect environment properly - use the host, not the URL
  const isDev = hostname.includes('localhost') || hostname.includes('127.0.0.1');

  if (isDev) {
    info('[extractSubdomain] development mode');
    if (hostname.includes('.localhost')) {
      const subdomain = hostname.split('.')[0];
      info('[extractSubdomain] dev subdomain:', { subdomain });
      return subdomain;
    }
    return null;
  }

  // PRODUCTION
  info('[extractSubdomain] production mode');
  const baseDomain = rootDomain.split(':')[0]; // 'sllty.com'

  info('[extractSubdomain] production check', {
    hostname,
    baseDomain,
    endsWith: hostname.endsWith(`.${baseDomain}`),
    isMainDomain: hostname === baseDomain,
    isWwwDomain: hostname === `www.${baseDomain}`
  });

  // Check if this is a subdomain
  if (hostname.endsWith(`.${baseDomain}`) && hostname !== baseDomain && hostname !== `www.${baseDomain}`) {
    const subdomain = hostname.replace(`.${baseDomain}`, '');
    info('[extractSubdomain] production subdomain:', { subdomain });
    return subdomain;
  }

  info('[extractSubdomain] no subdomain detected');
  return null;
}
