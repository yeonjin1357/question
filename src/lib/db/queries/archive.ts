import "server-only";

import { createServerSupabase } from "@/lib/db/server";

export interface ArchiveItem {
  id: string;
  publishDate: string;
  text: string;
  category: string;
  totalResponses: number;
  topCountry: string | null;
}

export interface ArchivePage {
  items: ArchiveItem[];
  /** 다음 요청 시 `cursor` 로 사용. null 이면 더 없음. */
  nextCursor: string | null;
}

export interface GetArchiveParams {
  locale: string;
  /** 이전 응답의 `nextCursor` — publish_date (YYYY-MM-DD). */
  cursor?: string;
  /** 페이지 크기. 기본 20, 최대 50. */
  limit?: number;
  category?: string;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/**
 * 아카이브된 질문 목록 + 각 항목의 총 응답 수 / 최다 응답 국가.
 *
 * 성능:
 *   - Phase A 에선 응답별 GROUP BY 를 JS 에서 수행하므로 항목 수 × 평균 응답 수 만큼 읽습니다.
 *   - 아카이브가 수백 건 / 수만 응답 이상이 되면 `daily_aggregates` 를 채워 해당 테이블로 전환 (T-052).
 */
export async function getArchive(params: GetArchiveParams): Promise<ArchivePage> {
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const db = createServerSupabase();

  let query = db
    .from("questions")
    .select("id, publish_date, category")
    .eq("status", "archived")
    .order("publish_date", { ascending: false })
    .limit(limit + 1);

  if (params.cursor) query = query.lt("publish_date", params.cursor);
  if (params.category) query = query.eq("category", params.category);

  const { data: questionRows } = await query;
  const rows = questionRows ?? [];
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  if (pageRows.length === 0) return { items: [], nextCursor: null };

  const ids = pageRows.map((q) => q.id);

  const [{ data: translations }, { data: responses }] = await Promise.all([
    db
      .from("question_translations")
      .select("question_id, locale, text")
      .in("question_id", ids)
      .in("locale", Array.from(new Set([params.locale, "en"]))),
    db.from("responses").select("question_id, country_code").in("question_id", ids),
  ]);

  const byQuestionText = new Map<string, string>();
  for (const q of pageRows) {
    const exact = translations?.find((t) => t.question_id === q.id && t.locale === params.locale);
    const fallback = translations?.find((t) => t.question_id === q.id && t.locale === "en");
    byQuestionText.set(q.id, (exact ?? fallback)?.text ?? "");
  }

  const perQuestion = new Map<string, { total: number; countryCounts: Map<string, number> }>();
  for (const id of ids) perQuestion.set(id, { total: 0, countryCounts: new Map() });
  for (const r of responses ?? []) {
    const bucket = perQuestion.get(r.question_id);
    if (!bucket) continue;
    bucket.total += 1;
    if (r.country_code) {
      bucket.countryCounts.set(
        r.country_code,
        (bucket.countryCounts.get(r.country_code) ?? 0) + 1,
      );
    }
  }

  const items: ArchiveItem[] = pageRows.map((q) => {
    const stats = perQuestion.get(q.id) ?? { total: 0, countryCounts: new Map() };
    let topCountry: string | null = null;
    let topCount = 0;
    for (const [cc, n] of stats.countryCounts) {
      if (n > topCount) {
        topCountry = cc;
        topCount = n;
      }
    }
    return {
      id: q.id,
      publishDate: q.publish_date,
      text: byQuestionText.get(q.id) ?? "",
      category: q.category,
      totalResponses: stats.total,
      topCountry,
    };
  });

  const nextCursor = hasMore ? (pageRows[pageRows.length - 1]?.publish_date ?? null) : null;
  return { items, nextCursor };
}

/**
 * 특정 publish_date 의 아카이브 질문 조회 (단건).
 */
export async function getArchiveByDate(
  publishDate: string,
): Promise<{ id: string; publishDate: string; category: string } | null> {
  const db = createServerSupabase();
  const { data } = await db
    .from("questions")
    .select("id, publish_date, category")
    .eq("status", "archived")
    .eq("publish_date", publishDate)
    .maybeSingle();
  if (!data) return null;
  return { id: data.id, publishDate: data.publish_date, category: data.category };
}
