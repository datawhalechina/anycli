import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { __anycliRedis?: Redis };

export function getRedis() {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (!globalForRedis.__anycliRedis) {
    globalForRedis.__anycliRedis = new Redis(url, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: true,
    });
  }
  return globalForRedis.__anycliRedis;
}

export async function redisGetJson<T>(key: string): Promise<T | null> {
  const r = getRedis();
  if (!r) return null;
  try {
    await r.connect().catch(() => {});
    const raw = await r.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function redisSetJson(key: string, value: unknown, ttlSec: number) {
  const r = getRedis();
  if (!r) return;
  try {
    await r.connect().catch(() => {});
    await r.set(key, JSON.stringify(value), "EX", Math.max(1, Math.floor(ttlSec)));
  } catch {
    // ignore redis failures (fallback to DB)
  }
}

