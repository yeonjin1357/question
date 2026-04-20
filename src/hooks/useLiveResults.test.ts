import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __testUtils } from "./useLiveResults";

describe("msUntilNextUtcMidnight", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("자정 직후: 거의 24시간", () => {
    vi.setSystemTime(new Date("2026-04-20T00:00:01Z"));
    const ms = __testUtils.msUntilNextUtcMidnight();
    expect(ms).toBeGreaterThan(86_300_000);
    expect(ms).toBeLessThanOrEqual(86_400_000);
  });

  it("자정 직전: 몇 초만 남음", () => {
    vi.setSystemTime(new Date("2026-04-20T23:59:55Z"));
    const ms = __testUtils.msUntilNextUtcMidnight();
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThanOrEqual(5_000);
  });

  it("정확히 자정: 0 또는 양수", () => {
    vi.setSystemTime(new Date("2026-04-20T00:00:00Z"));
    const ms = __testUtils.msUntilNextUtcMidnight();
    expect(ms).toBeGreaterThanOrEqual(0);
  });
});
