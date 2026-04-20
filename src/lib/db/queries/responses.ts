import "server-only";

import { createServerSupabase } from "@/lib/db/server";

/**
 * 특정 질문에 대해 해당 세션 해시의 응답이 있는지 조회.
 */
export async function getMyResponse(
  questionId: string,
  sessionHash: string,
): Promise<{ optionId: string } | null> {
  const db = createServerSupabase();
  const { data } = await db
    .from("responses")
    .select("option_id")
    .eq("question_id", questionId)
    .eq("session_hash", sessionHash)
    .maybeSingle();

  return data ? { optionId: data.option_id } : null;
}

export type InsertResponseOutcome =
  | { ok: true; id: string }
  | { ok: false; code: "DUPLICATE"; previousOptionId: string | null }
  | { ok: false; code: "UNKNOWN"; message: string };

/**
 * 응답 INSERT. DB UNIQUE(question_id, session_hash) 위반 시 `DUPLICATE` 아웃컴으로
 * 기존 응답의 optionId 를 함께 반환 (UX 에서 "당신은 X 를 골랐었습니다" 표시에 사용).
 */
export async function insertResponse(params: {
  questionId: string;
  optionId: string;
  countryCode: string | null;
  sessionHash: string;
}): Promise<InsertResponseOutcome> {
  const db = createServerSupabase();
  const { data, error } = await db
    .from("responses")
    .insert({
      question_id: params.questionId,
      option_id: params.optionId,
      country_code: params.countryCode,
      session_hash: params.sessionHash,
    })
    .select("id")
    .single();

  if (!error && data) return { ok: true, id: data.id };

  // Postgres unique violation
  if (error?.code === "23505") {
    const { data: existing } = await db
      .from("responses")
      .select("option_id")
      .eq("question_id", params.questionId)
      .eq("session_hash", params.sessionHash)
      .maybeSingle();
    return {
      ok: false,
      code: "DUPLICATE",
      previousOptionId: existing?.option_id ?? null,
    };
  }

  return { ok: false, code: "UNKNOWN", message: error?.message ?? "insert failed" };
}
