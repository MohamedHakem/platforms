import Redis from 'ioredis';

const redisUrl = process.env.KV_REST_API_URL;

// When building or running locally without a configured Redis URL,
// avoid creating a real ioredis connection (which will attempt to connect
// to localhost and can fail during `next build`). Provide a minimal no-op
// stub so server code can call Redis methods safely during build.
let redis: any;
if (redisUrl) {
	redis = new Redis(redisUrl);
} else {
	redis = {
		get: async () => null,
		set: async () => null,
		keys: async () => [] as string[],
		mget: async (..._: any[]) => [] as (string | null)[],
		del: async () => null,
	};
}

export { redis };
