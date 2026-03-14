import { type NextRequest } from 'next/server';

/**
 * Reconstructs the true URL from the request
 * This solves the Next.js localhost-in-production problem
 */

export function getTrueUrl(request: NextRequest): string {
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  return `${protocol}://${host}${pathname}${search}`;
}
