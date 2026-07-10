import Redis from 'ioredis';

let client: Redis | null = null;

function getCacheClient(): Redis {
  if (!client) {
    client = new Redis(process.env.REDIS_URL || 'redis://redis:6379', {
      lazyConnect: true,
      enableOfflineQueue: false,
    });
  }

  return client;
}

export async function getCachedValue<T = unknown>(key: string): Promise<T | null> {
  try {
    const redis = getCacheClient();
    await redis.connect();
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export async function setCachedValue(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  try {
    const redis = getCacheClient();
    await redis.connect();
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // ignore cache write failures
  }
}
