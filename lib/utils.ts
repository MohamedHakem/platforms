import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

export const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

// Full site origin can be set explicitly in production (including protocol).
// Example: NEXT_PUBLIC_SITE_ORIGIN=https://sllty.com
export const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN || `${protocol}://${rootDomain}`;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
