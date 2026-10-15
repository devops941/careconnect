import { describe, it, expect } from "vitest";
import { rateLimiter } from "@/server/middleware/rate-limit";
import { RateLimitError } from "@/server/errors/app-error";

describe("RateLimiter", () => {
  it("should allow requests under the limit", () => {
    const key = `test_ip_${Date.now()}`;
    const result1 = rateLimiter.check(key, 3, 10);
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = rateLimiter.check(key, 3, 10);
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);
  });

  it("should block requests when limit is exceeded", () => {
    const key = `test_blocked_${Date.now()}`;
    rateLimiter.check(key, 2, 10);
    rateLimiter.check(key, 2, 10);

    const result3 = rateLimiter.check(key, 2, 10);
    expect(result3.allowed).toBe(false);
    expect(result3.remaining).toBe(0);
  });

  it("should throw RateLimitError on assertLimit violation", () => {
    const key = `test_assert_${Date.now()}`;
    rateLimiter.check(key, 1, 10);

    expect(() => {
      rateLimiter.assertLimit(key, 1, 10);
    }).toThrow(RateLimitError);
  });
});
