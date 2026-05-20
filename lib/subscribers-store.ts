import { Redis } from "@upstash/redis";

let cached: Redis | null | undefined;

function getRedis(): Redis | null {
  if (cached !== undefined) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  cached = url && token ? new Redis({ url, token }) : null;
  return cached;
}

export function isSubscribersStoreConfigured(): boolean {
  return getRedis() !== null;
}

const HASH_KEY = "subscribers";

export type StoredSubscriber = {
  email: string;
  ts: string;
  mode: string;
};

export async function addSubscriber(email: string, mode: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const existing = await redis.hget<StoredSubscriber>(HASH_KEY, email);
  if (existing) return;
  const value: StoredSubscriber = {
    email,
    ts: new Date().toISOString(),
    mode,
  };
  await redis.hset(HASH_KEY, { [email]: value });
}

export async function listSubscribers(): Promise<StoredSubscriber[]> {
  const redis = getRedis();
  if (!redis) return [];
  const all = await redis.hgetall<Record<string, StoredSubscriber>>(HASH_KEY);
  if (!all) return [];
  return Object.values(all).sort((a, b) => (a.ts < b.ts ? 1 : -1));
}

export async function countSubscribers(): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  return (await redis.hlen(HASH_KEY)) ?? 0;
}
