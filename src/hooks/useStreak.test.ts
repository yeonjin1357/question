import { describe, expect, it } from "vitest";

import { computeNextStreak } from "./useStreak";

describe("computeNextStreak", () => {
  it("prev 없음: count=1", () => {
    const r = computeNextStreak(null, "2026-04-20");
    if ("noop" in r) throw new Error("expected stored");
    expect(r.stored).toEqual({ last: "2026-04-20", count: 1 });
    expect(r.hitMilestone).toBeNull();
  });

  it("어제 → 오늘: +1", () => {
    const r = computeNextStreak({ last: "2026-04-20", count: 2 }, "2026-04-21");
    if ("noop" in r) throw new Error("expected stored");
    expect(r.stored.count).toBe(3);
    expect(r.hitMilestone).toBe(3);
  });

  it("같은 날: noop", () => {
    const r = computeNextStreak({ last: "2026-04-20", count: 2 }, "2026-04-20");
    expect("noop" in r && r.noop).toBe(true);
  });

  it("공백 2일 이상: 1 로 리셋", () => {
    const r = computeNextStreak({ last: "2026-04-20", count: 5 }, "2026-04-25");
    if ("noop" in r) throw new Error("expected stored");
    expect(r.stored.count).toBe(1);
    expect(r.hitMilestone).toBeNull();
  });

  it("마일스톤 7일", () => {
    const r = computeNextStreak({ last: "2026-04-20", count: 6 }, "2026-04-21");
    if ("noop" in r) throw new Error("expected stored");
    expect(r.hitMilestone).toBe(7);
  });

  it("마일스톤 100일", () => {
    const r = computeNextStreak({ last: "2026-04-20", count: 99 }, "2026-04-21");
    if ("noop" in r) throw new Error("expected stored");
    expect(r.hitMilestone).toBe(100);
  });

  it("비마일스톤은 null", () => {
    const r = computeNextStreak({ last: "2026-04-20", count: 4 }, "2026-04-21");
    if ("noop" in r) throw new Error("expected stored");
    expect(r.stored.count).toBe(5);
    expect(r.hitMilestone).toBeNull();
  });
});
