import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export interface RotationResult {
  /** UTC 기준 오늘 날짜 (YYYY-MM-DD) — rotation 이 기준으로 삼은 값 */
  todayUtc: string;
  /** scheduled → live 로 승격된 질문 수 (0 또는 1 — publish_date unique) */
  promoted: number;
  /** live → archived 로 내려간 질문 수 (정상 상태에선 0 또는 1) */
  archived: number;
  /** 승격 후 live 상태인 질문 id (없으면 null) */
  liveQuestionId: string | null;
}

/**
 * UTC 기준 오늘 날짜의 YYYY-MM-DD 문자열.
 * 서버 로컬 시간이 아닌 UTC 를 써야 `publish_date` 컬럼과 일치.
 */
export function todayUtcDateString(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * 일일 질문 상태 전환.
 *
 * 1) publish_date = today_utc 이고 status = 'scheduled' → 'live'
 * 2) publish_date < today_utc 이고 status = 'live' → 'archived'
 *
 * 두 UPDATE 는 독립적이라 순서는 중요하지 않지만, 먼저 오래된 live 를 정리한 뒤
 * 새 live 를 승격시키는 것이 "live 질문이 일시적으로 2개" 인 윈도우를 없앱니다.
 *
 * 재실행 안전 (idempotent): 조건에 맞는 행이 없으면 0행 변경.
 */
export async function rotateQuestionStatuses(
  db: SupabaseClient<Database>,
  todayUtc: string = todayUtcDateString(),
): Promise<RotationResult> {
  const { data: archivedRows, error: archiveErr } = await db
    .from("questions")
    .update({ status: "archived" })
    .lt("publish_date", todayUtc)
    .eq("status", "live")
    .select("id");
  if (archiveErr) throw archiveErr;

  const { data: promotedRows, error: promoteErr } = await db
    .from("questions")
    .update({ status: "live" })
    .eq("publish_date", todayUtc)
    .eq("status", "scheduled")
    .select("id");
  if (promoteErr) throw promoteErr;

  const liveQuestionId =
    promotedRows?.[0]?.id ??
    (
      await db
        .from("questions")
        .select("id")
        .eq("status", "live")
        .eq("publish_date", todayUtc)
        .maybeSingle()
    ).data?.id ??
    null;

  return {
    todayUtc,
    promoted: promotedRows?.length ?? 0,
    archived: archivedRows?.length ?? 0,
    liveQuestionId,
  };
}
