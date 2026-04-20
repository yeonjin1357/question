import "server-only";

import { createServerSupabase } from "@/lib/db/server";

export interface HistoryItem {
  questionId: string;
  publishDate: string;
  category: string;
  questionText: string;
  myOptionId: string;
  myOptionText: string;
  answeredAt: string;
}

/**
 * 특정 세션 해시가 지금까지 답한 질문 목록 (최신 순).
 *
 * 주의: session_hash 는 매일 UTC 자정에 daily salt 가 바뀌면서 재계산되므로
 * "어제 답한 것" 은 오늘 해시로는 조회되지 않는다. 이 한계는 의도된 프라이버시 설계
 * (사용자를 장기적으로 추적하지 않기 위함). 따라서 이 페이지는 사실상 "오늘 답한 내역"
 * 수준으로만 동작. 추후 Layer 2 쿠키(answered:<qid>=1) 리스트로 확장 여지 있음.
 */
export async function getMyHistory(
  sessionHash: string,
  locale: string,
  limit = 50,
): Promise<HistoryItem[]> {
  const db = createServerSupabase();

  const { data: responses } = await db
    .from("responses")
    .select("question_id, option_id, created_at")
    .eq("session_hash", sessionHash)
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = responses ?? [];
  if (rows.length === 0) return [];

  const questionIds = Array.from(new Set(rows.map((r) => r.question_id)));
  const optionIds = Array.from(new Set(rows.map((r) => r.option_id)));

  const [{ data: questions }, { data: questionTranslations }, { data: optionTranslations }] =
    await Promise.all([
      db
        .from("questions")
        .select("id, publish_date, category")
        .in("id", questionIds),
      db
        .from("question_translations")
        .select("question_id, locale, text")
        .in("question_id", questionIds)
        .in("locale", Array.from(new Set([locale, "en"]))),
      db
        .from("option_translations")
        .select("option_id, locale, text")
        .in("option_id", optionIds)
        .in("locale", Array.from(new Set([locale, "en"]))),
    ]);

  const questionById = new Map((questions ?? []).map((q) => [q.id, q]));

  function pickText<
    T extends { locale: string; text: string },
    K extends string,
  >(rows: T[] | null | undefined, key: K, id: string): string {
    const list = (rows ?? []).filter(
      (r) => (r as unknown as Record<K, string>)[key] === id,
    );
    return (
      list.find((r) => r.locale === locale)?.text ??
      list.find((r) => r.locale === "en")?.text ??
      ""
    );
  }

  return rows.flatMap<HistoryItem>((r) => {
    const q = questionById.get(r.question_id);
    if (!q) return [];
    return [
      {
        questionId: r.question_id,
        publishDate: q.publish_date,
        category: q.category,
        questionText: pickText(
          questionTranslations as Array<{ question_id: string; locale: string; text: string }>,
          "question_id",
          r.question_id,
        ),
        myOptionId: r.option_id,
        myOptionText: pickText(
          optionTranslations as Array<{ option_id: string; locale: string; text: string }>,
          "option_id",
          r.option_id,
        ),
        answeredAt: r.created_at,
      },
    ];
  });
}
