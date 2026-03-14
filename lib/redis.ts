import Redis from 'ioredis';
import { debug, info } from './log';

const redisUrl = process.env.KV_REST_API_URL;

// When building or running locally without a configured Redis URL,
// avoid creating a real ioredis connection (which will attempt to connect
// and may produce unhandled errors). Provide a minimal no-op stub so
// server code can call Redis methods safely during build/runtime.
let redis: any;
let isStub = false;
if (redisUrl) {
	debug('Creating ioredis client for URL', redisUrl);
	redis = new Redis(redisUrl);
} else {
	isStub = true;
	info('KV_REST_API_URL not set — using Redis stub (no-op)');
	const makeStub = (name: string, ret: any) => {
		return async (..._args: any[]) => {
			debug('redis stub call', name, ..._args);
			return ret;
		};
	};

	redis = {
		get: makeStub('get', null),
		set: makeStub('set', null),
		keys: makeStub('keys', [] as string[]),
		mget: makeStub('mget', [] as (string | null)[]),
		del: makeStub('del', null),
	};
}

export { redis };
export const isRedisStub = isStub;
