import { describe, expect, it, vi } from "vitest";

import { rotateQuestionStatuses, todayUtcDateString } from "./rotation";

describe("todayUtcDateString", () => {
  it("returns UTC date regardless of server tz", () => {
    // 로컬 시간대에 관계없이 UTC 날짜를 반환해야 함.
    expect(todayUtcDateString(new Date("2026-04-19T23:30:00Z"))).toBe("2026-04-19");
    expect(todayUtcDateString(new Date("2026-04-20T00:00:00Z"))).toBe("2026-04-20");
  });
});

/**
 * 테스트용 경량 fake Supabase 체이너블 API.
 * 실제 supabase-js 의 체인 호출 순서를 따라가면서, 각 테이블별 동작을 기록/반환합니다.
 */
interface Call {
  table: string;
  op: "update" | "select";
  payload?: unknown;
  filters: Array<[string, string, unknown]>;
}

function makeFakeDb(
  scenarios: Record<string, (filters: Array<[string, string, unknown]>) => unknown>,
) {
  const calls: Call[] = [];

  function builder(table: string, op: "update" | "select", payload?: unknown) {
    const filters: Array<[string, string, unknown]> = [];
    const api: Record<string, unknown> = {};
    const apply = (comp: string) =>
      function (col: string, val: unknown) {
        filters.push([comp, col, val]);
        return api;
      };
    Object.assign(api, {
      eq: apply("eq"),
      lt: apply("lt"),
      select: () => {
        calls.push({ table, op, payload, filters });
        const key = `${table}.${op}.select`;
        const data = scenarios[key]?.(filters);
        return Promise.resolve({ data, error: null });
      },
      maybeSingle: () => {
        calls.push({ table, op, payload, filters });
        const key = `${table}.${op}.maybeSingle`;
        const data = scenarios[key]?.(filters);
        return Promise.resolve({ data, error: null });
      },
    });
    return api;
  }

  return {
    calls,
    db: {
      from(table: string) {
        return {
          update: (payload: unknown) => builder(table, "update", payload),
          select: () => builder(table, "select"),
        };
      },
    },
  };
}

describe("rotateQuestionStatuses", () => {
  it("promotes scheduled→live for today and archives old live questions", async () => {
    const { db, calls } = makeFakeDb({
      "questions.update.select": (filters) => {
        // 1st update: archive (lt publish_date, eq status=live) — 1행 영향
        // 2nd update: promote (eq publish_date, eq status=scheduled) — 1행 영향
        const isArchive = filters.some((f) => f[0] === "lt" && f[1] === "publish_date");
        return isArchive
          ? [{ id: "old-live-uuid" }]
          : [{ id: "new-live-uuid" }];
      },
    });

    const res = await rotateQuestionStatuses(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      db as any,
      "2026-04-19",
    );

    expect(res.archived).toBe(1);
    expect(res.promoted).toBe(1);
    expect(res.liveQuestionId).toBe("new-live-uuid");
    expect(res.todayUtc).toBe("2026-04-19");

    // 두 번의 UPDATE 가 실제 수행됐는지 확인 (archive 먼저, promote 나중)
    const updates = calls.filter((c) => c.op === "update");
    expect(updates).toHaveLength(2);
    expect(updates[0]?.payload).toEqual({ status: "archived" });
    expect(updates[1]?.payload).toEqual({ status: "live" });
  });

  it("is a no-op when no rows match", async () => {
    const { db } = makeFakeDb({
      "questions.update.select": () => [],
      "questions.select.maybeSingle": () => null,
    });
    const res = await rotateQuestionStatuses(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      db as any,
      "2026-04-19",
    );
    expect(res.promoted).toBe(0);
    expect(res.archived).toBe(0);
    expect(res.liveQuestionId).toBe(null);
  });

  it("returns existing live question id when nothing to promote but a live already exists", async () => {
    // 재실행(idempotent) 시나리오: 이미 승격된 상태에서 다시 호출.
    const { db } = makeFakeDb({
      "questions.update.select": () => [],
      "questions.select.maybeSingle": (filters) => {
        // 조회 조건은 status=live AND publish_date=todayUtc
        const hasLive = filters.some((f) => f[0] === "eq" && f[1] === "status" && f[2] === "live");
        const hasDate = filters.some((f) => f[0] === "eq" && f[1] === "publish_date");
        return hasLive && hasDate ? { id: "already-live-uuid" } : null;
      },
    });
    const res = await rotateQuestionStatuses(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      db as any,
      "2026-04-19",
    );
    expect(res.promoted).toBe(0);
    expect(res.archived).toBe(0);
    expect(res.liveQuestionId).toBe("already-live-uuid");
  });

  it("uses today's UTC date when no override given", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-20T05:00:00Z"));
    try {
      const { db, calls } = makeFakeDb({
        "questions.update.select": () => [],
        "questions.select.maybeSingle": () => null,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await rotateQuestionStatuses(db as any);
      const filters = calls.find((c) => c.op === "update" && c.table === "questions")?.filters;
      const datePredicate = filters?.find((f) => f[1] === "publish_date");
      expect(datePredicate?.[2]).toBe("2026-04-20");
    } finally {
      vi.useRealTimers();
    }
  });
});
