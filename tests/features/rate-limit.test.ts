import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSlidingWindowRateLimiter } from "../../lib/features/server/rate-limit.ts";

describe("sliding-window rate limiter", () => {
  it("allows up to 20 requests within a 60-second window and blocks the 21st", () => {
    const now = 1_000_000;
    const limiter = createSlidingWindowRateLimiter({
      maxRequests: 20,
      windowMs: 60_000,
      now: () => now,
    });

    for (let i = 1; i <= 20; i += 1) {
      const result = limiter.consume("203.0.113.10");
      assert.equal(result.allowed, true);
      assert.equal(result.remaining, 20 - i);
      assert.equal(result.retryAfterSeconds, 0);
    }

    const blocked = limiter.consume("203.0.113.10");
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.remaining, 0);
    assert.equal(blocked.retryAfterSeconds, 60);
  });

  it("recovers capacity once the oldest timestamp exits the 60-second window", () => {
    let now = 2_000_000;
    const limiter = createSlidingWindowRateLimiter({
      maxRequests: 2,
      windowMs: 60_000,
      now: () => now,
    });

    assert.equal(limiter.consume("198.51.100.4").allowed, true);
    now += 15_000;
    assert.equal(limiter.consume("198.51.100.4").allowed, true);

    const blocked = limiter.consume("198.51.100.4");
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.retryAfterSeconds, 45);

    now += 45_001;
    const allowedAgain = limiter.consume("198.51.100.4");
    assert.equal(allowedAgain.allowed, true);
    assert.equal(allowedAgain.remaining, 0);
  });

  it("isolates visitors by key and bounds stored key count", () => {
    const now = 3_000_000;
    const limiter = createSlidingWindowRateLimiter({
      maxRequests: 1,
      windowMs: 60_000,
      maxKeys: 3,
      now: () => now,
    });

    assert.equal(limiter.consume("visitor-1").allowed, true);
    assert.equal(limiter.consume("visitor-2").allowed, true);
    assert.equal(limiter.consume("visitor-3").allowed, true);
    assert.equal(limiter.consume("visitor-4").allowed, true);
    assert.ok(limiter.size() <= 3);
    assert.equal(limiter.consume("visitor-4").allowed, false);
  });
});
