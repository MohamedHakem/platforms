#!/usr/bin/env node
const Redis = require('ioredis');

const url = process.env.KV_REST_API_URL || 'redis://127.0.0.1:6379';
const [,, key, value] = process.argv;

if (!key || !value) {
  console.error('Usage: KV_REST_API_URL=redis://host:port node scripts/seed-redis.js <key> <value>');
  process.exit(2);
}

async function run() {
  const redis = new Redis(url);
  try {
    console.log('Connecting to Redis at', url);
    await redis.set(key, value);
    console.log('Set', key);
    const got = await redis.get(key);
    console.log('Verified:', got);
    process.exit(0);
  } catch (err) {
    console.error('Redis error:', err);
    process.exit(1);
  } finally {
    redis.disconnect();
  }
}

run();
