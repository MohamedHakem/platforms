import { redis } from '@/lib/redis';
import { debug, info, warn, error } from '@/lib/log';

export function isValidIcon(str: string) {
  if (str.length > 10) {
    return false;
  }

  try {
    // Primary validation: Check if the string contains at least one emoji character
    // This regex pattern matches most emoji Unicode ranges
    const emojiPattern = /[\p{Emoji}]/u;
    if (emojiPattern.test(str)) {
      return true;
    }
  } catch (error) {
    // If the regex fails (e.g., in environments that don't support Unicode property escapes),
    // fall back to a simpler validation
    console.warn('Emoji regex validation failed, using fallback validation', error);
  }

  // Fallback validation: Check if the string is within a reasonable length
  // This is less secure but better than no validation
  return str.length >= 1 && str.length <= 10;
}

type SubdomainData = {
  emoji: string;
  createdAt: number;
};

export async function getSubdomainData(subdomain: string): Promise<SubdomainData | null> {
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  try {
    debug('Fetching subdomain data', sanitizedSubdomain);
    const raw = await redis.get(`subdomain:${sanitizedSubdomain}`);
    if (!raw) {
      debug('No subdomain data found for', sanitizedSubdomain);
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as SubdomainData;
      debug('Parsed subdomain data', sanitizedSubdomain, parsed);
      return parsed;
    } catch (err) {
      warn('Failed to parse subdomain data from Redis for', sanitizedSubdomain, err);
      return null;
    }
  } catch (err) {
    error('Error fetching subdomain data for', sanitizedSubdomain, err);
    return null;
  }
}

export async function getAllSubdomains(): Promise<{ subdomain: string; emoji: string; createdAt: number }[]> {
  try {
    debug('Listing subdomain keys');
    const keys = (await redis.keys('subdomain:*')) as string[];

    if (!keys.length) {
      debug('No subdomains found');
      return [];
    }

    debug('Found subdomain keys', keys.length);
    const values = (await redis.mget(...keys)) as (string | null)[];

    return keys.map((key, index) => {
      const subdomain = key.replace('subdomain:', '');
      const raw = values[index];
      let data: SubdomainData | null = null;

      if (raw) {
        try {
          data = JSON.parse(raw) as SubdomainData;
        } catch (err) {
          warn('Failed to parse subdomain data from Redis for', subdomain, err);
        }
      }

      return {
        subdomain,
        emoji: data?.emoji ?? '❓',
        createdAt: data?.createdAt ?? Date.now()
      };
    });
  } catch (err) {
    error('Error listing all subdomains', err);
    return [];
  }
}
