import Redis from 'ioredis';

const redisUrl = process.env.KV_REST_API_URL;
export const redis = redisUrl ? new Redis(redisUrl) : new Redis();
