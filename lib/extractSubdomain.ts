import { rootDomain } from '@/lib/utils';
import { type NextRequest } from 'next/server';
import { error, info } from './log';

export function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  info('[extractSubdomain] extractSubdomain', { url, host, hostname });

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

  const result = isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null;
  info('[extractSubdomain] returning:', result);

  return result;
}
