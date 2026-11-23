import RedisPkg from "ioredis";

// Handle both ESM and CommonJS exports cleanly
const RedisClient: any = (RedisPkg as any).default || RedisPkg;

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

// Memory storage for dev fallback when Redis server is offline
interface MemoryItem {
  value: string;
  expiresAt: number;
}
const memoryStore = new Map<string, MemoryItem>();

let isConnected = false;

let actualRedis: any = null;
try {
  actualRedis = new RedisClient(redisUrl, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy(times: number) {
      if (times > 2) {
        return null; // Stop retrying if Redis is not running locally
      }
      return 1000;
    },
  });

  actualRedis.on("connect", () => {
    isConnected = true;
    console.log("[Redis] Connected successfully to");
  });

  actualRedis.on("ready", () => {
    isConnected = true;
  });

  actualRedis.on("error", (err: any) => {
    isConnected = false;
    if (process.env.NODE_ENV === "production") {
      console.error("[Redis] Connection error:", err.message);
    }
  });

  // Attempt initial connection without blocking app startup
  actualRedis.connect().catch((err: any) => {
    isConnected = false;
    if (process.env.NODE_ENV === "production") {
      console.error("[Redis] Failed to connect in production:", err.message);
    } else {
      console.log(
        "[Redis] Local Redis not active. Activated built-in memory store fallback.",
      );
    }
  });
} catch (err: any) {
  console.warn("[Redis] Failed to initialize Redis client:", err.message);
}

// Helper for memory cleanup
function getMemoryValue(key: string): string | null {
  const item = memoryStore.get(key);
  if (!item) return null;
  if (item.expiresAt > 0 && Date.now() > item.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return item.value;
}

function setMemoryValue(key: string, value: string, ttlSeconds?: number): void {
  const expiresAt =
    ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0;
  memoryStore.set(key, { value, expiresAt });
}

// Resilient Redis proxy that automatically delegates to memory if Redis is unavailable
export const redis = {
  isAvailable(): boolean {
    return isConnected;
  },

  async get(key: string): Promise<string | null> {
    if (isConnected && actualRedis) {
      try {
        return await actualRedis.get(key);
      } catch {
        // Fallback to memory
      }
    }
    return getMemoryValue(key);
  },

  async set(
    key: string,
    value: string,
    mode?: string,
    duration?: number,
  ): Promise<string | null> {
    if (isConnected && actualRedis) {
      try {
        if (mode === "EX" && typeof duration === "number") {
          return await actualRedis.set(key, value, "EX", duration);
        }
        return await actualRedis.set(key, value);
      } catch {
        // Fallback to memory
      }
    }
    const ttl =
      mode === "EX" && typeof duration === "number" ? duration : undefined;
    setMemoryValue(key, value, ttl);
    return "OK";
  },

  async del(...keys: string[]): Promise<number> {
    if (isConnected && actualRedis) {
      try {
        return await actualRedis.del(...keys);
      } catch {
        // Fallback to memory
      }
    }
    let count = 0;
    for (const key of keys) {
      if (memoryStore.delete(key)) count++;
    }
    return count;
  },

  async exists(key: string): Promise<number> {
    if (isConnected && actualRedis) {
      try {
        return await actualRedis.exists(key);
      } catch {
        // Fallback to memory
      }
    }
    return getMemoryValue(key) !== null ? 1 : 0;
  },

  async incr(key: string): Promise<number> {
    if (isConnected && actualRedis) {
      try {
        return await actualRedis.incr(key);
      } catch {
        // Fallback to memory
      }
    }
    const current = getMemoryValue(key);
    const nextVal = (current ? parseInt(current, 10) : 0) + 1;
    const item = memoryStore.get(key);
    const ttlSec =
      item && item.expiresAt > 0
        ? Math.max(1, Math.round((item.expiresAt - Date.now()) / 1000))
        : undefined;
    setMemoryValue(key, nextVal.toString(), ttlSec);
    return nextVal;
  },

  async expire(key: string, seconds: number): Promise<number> {
    if (isConnected && actualRedis) {
      try {
        return await actualRedis.expire(key, seconds);
      } catch {
        // Fallback to memory
      }
    }
    const val = getMemoryValue(key);
    if (val === null) return 0;
    setMemoryValue(key, val, seconds);
    return 1;
  },

  pipeline() {
    const queue: Array<() => Promise<any>> = [];

    const pipe = {
      set(key: string, value: string, mode?: string, duration?: number) {
        queue.push(() => redis.set(key, value, mode, duration));
        return pipe;
      },
      incr(key: string) {
        queue.push(() => redis.incr(key));
        return pipe;
      },
      expire(key: string, seconds: number) {
        queue.push(() => redis.expire(key, seconds));
        return pipe;
      },
      del(...keys: string[]) {
        queue.push(() => redis.del(...keys));
        return pipe;
      },
      async exec() {
        if (isConnected && actualRedis) {
          try {
            const actualPipe = actualRedis.pipeline();
            for (const op of queue) {
              // Execute operations
            }
          } catch {
            // Fallback
          }
        }
        const results = [];
        for (const op of queue) {
          results.push([null, await op()]);
        }
        return results;
      },
    };

    return pipe;
  },
};

export default redis;
