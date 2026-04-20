import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetRateLimitStore, rateLimit } from "./ratelimit";

describe("rateLimit", () => {
  beforeEach(() => {
    __resetRateLimitStore();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-18T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit", () => {
    for (let i = 0; i < 5; i++) {
      const r = rateLimit("1.2.3.4", { windowSeconds: 60, max: 5, key: "test" });
      expect(r.ok).toBe(true);
      expect(r.remaining).toBe(4 - i);
    }
  });

  it("blocks the next request after the limit and reports retry-after", () => {
    const opts = { windowSeconds: 60, max: 2, key: "test" };
    rateLimit("1.2.3.4", opts);
    rateLimit("1.2.3.4", opts);
    const blocked = rateLimit("1.2.3.4", opts);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
    expect(blocked.remaining).toBe(0);
  });

  it("resets after the window elapses", () => {
    const opts = { windowSeconds: 60, max: 1, key: "test" };
    expect(rateLimit("1.2.3.4", opts).ok).toBe(true);
    expect(rateLimit("1.2.3.4", opts).ok).toBe(false);
    vi.advanceTimersByTime(61_000);
    expect(rateLimit("1.2.3.4", opts).ok).toBe(true);
  });

  it("tracks different clients independently", () => {
    const opts = { windowSeconds: 60, max: 1, key: "test" };
    expect(rateLimit("1.1.1.1", opts).ok).toBe(true);
    expect(rateLimit("2.2.2.2", opts).ok).toBe(true);
    expect(rateLimit("1.1.1.1", opts).ok).toBe(false);
  });

  it("separates counters by key (route)", () => {
    expect(rateLimit("1.2.3.4", { windowSeconds: 60, max: 1, key: "a" }).ok).toBe(true);
    expect(rateLimit("1.2.3.4", { windowSeconds: 60, max: 1, key: "b" }).ok).toBe(true);
    expect(rateLimit("1.2.3.4", { windowSeconds: 60, max: 1, key: "a" }).ok).toBe(false);
  });

  it("evicts oldest entries when exceeding maxEntries", () => {
    const opts = { windowSeconds: 60, max: 1, key: "test", maxEntries: 3 };
    rateLimit("a", opts);
    rateLimit("b", opts);
    rateLimit("c", opts);
    rateLimit("d", opts); // triggers eviction; oldest ("a") 가 제거돼야 함
    // "a" 엔트리가 재생성되지 않았다면 허용됨 (새 윈도우)
    expect(rateLimit("a", opts).ok).toBe(true);
  });
});
