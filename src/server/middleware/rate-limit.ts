import { RateLimitError } from "../errors/app-error";

interface RateLimitRecord {
  timestamps: number[];
}

class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodic garbage collection every 5 minutes to prevent memory leaks
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      const validTimestamps = record.timestamps.filter((t) => now - t < 15 * 60 * 1000);
      if (validTimestamps.length === 0) {
        this.records.delete(key);
      } else {
        record.timestamps = validTimestamps;
      }
    }
  }

  /**
   * Checks whether the current identifier has exceeded allowed request limit.
   */
  check(
    key: string,
    maxRequests = 10,
    windowSeconds = 60
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const windowStart = now - windowMs;

    let record = this.records.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.records.set(key, record);
    }

    // Keep only timestamps within current window
    record.timestamps = record.timestamps.filter((t) => t > windowStart);

    if (record.timestamps.length >= maxRequests) {
      const oldestInWindow = record.timestamps[0];
      const resetTime = Math.ceil((oldestInWindow + windowMs - now) / 1000);
      return { allowed: false, remaining: 0, resetTime };
    }

    record.timestamps.push(now);
    const remaining = maxRequests - record.timestamps.length;
    return { allowed: true, remaining, resetTime: windowSeconds };
  }

  /**
   * Asserts rate limit, throws RateLimitError if exceeded.
   */
  assertLimit(key: string, maxRequests = 10, windowSeconds = 60): void {
    const { allowed, resetTime } = this.check(key, maxRequests, windowSeconds);
    if (!allowed) {
      throw new RateLimitError(
        `Too many attempts. For security, please wait ${resetTime} seconds before trying again.`
      );
    }
  }
}

export const rateLimiter = new RateLimiter();
