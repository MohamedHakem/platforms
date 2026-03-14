import { rootDomain } from '@/lib/utils';
import { type NextRequest } from 'next/server';
import { info } from './log';

export function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Always log input
  info('[extractSubdomain] input', { url, host, hostname });

  let subdomain: string | null = null;

  // PRODUCTION - sllty.com
  if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
    const baseDomain = rootDomain.split(':')[0]; // 'sllty.com'

    // Check if this is a subdomain of sllty.com
    const isSubdomain = hostname !== baseDomain && hostname !== `www.${baseDomain}` && hostname.endsWith(`.${baseDomain}`);
    info('[extractSubdomain] production environment detected');
    info('[extractSubdomain] baseDomain detected', { baseDomain });
    info('[extractSubdomain] isSubdomain check', { isSubdomain, hostname, baseDomain });
    if (isSubdomain) {
      subdomain = hostname.replace(`.${baseDomain}`, '');
      info('[extractSubdomain] extracted subdomain', { subdomain });
    }
  }
  // LOCAL DEVELOPMENT - localhost
  else {
    // Pattern: anything.localhost
    if (hostname.includes('.localhost')) {
      subdomain = hostname.split('.')[0];
      info('[extractSubdomain] extracted subdomain (localhost)', { subdomain });
    }
  }

  // Log result
  info('[extractSubdomain] result', {
    subdomain,
    baseDomain: rootDomain.split(':')[0],
    hostname,
    isProd: !url.includes('localhost')
  });

  return subdomain;
}
