import "server-only";

import { createServerSupabase } from "@/lib/db/server";

export interface OptionAggregate {
  optionId: string;
  count: number;
  percent: number;
}

export interface CountryAggregate {
  country: string;
  total: number;
  options: OptionAggregate[];
}

export interface AggregateResult {
  global: OptionAggregate[];
  byCountry: CountryAggregate[];
}

function percent(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 1000) / 10;
}

/**
 * 주어진 질문의 전체 응답 분포 집계 (Phase A: 실시간 GROUP BY).
 * responses 를 모두 읽어 JS 에서 집계 — Supabase JS 가 GROUP BY 를 직접 지원하지 않기 때문.
 * ADR-004 의 Phase B 전환 시점에 뷰/트리거로 대체 예정.
 *
 * country_code 가 null 인 응답은 global 엔 포함되지만 byCountry 엔 포함되지 않습니다.
 */
export async function getAggregates(questionId: string): Promise<AggregateResult> {
  const db = createServerSupabase();
  const { data } = await db
    .from("responses")
    .select("option_id, country_code")
    .eq("question_id", questionId);

  const rows = data ?? [];

  const globalCounts = new Map<string, number>();
  for (const r of rows) {
    globalCounts.set(r.option_id, (globalCounts.get(r.option_id) ?? 0) + 1);
  }
  const globalTotal = rows.length;
  const global: OptionAggregate[] = Array.from(globalCounts.entries())
    .map(([optionId, count]) => ({
      optionId,
      count,
      percent: percent(count, globalTotal),
    }))
    .sort((a, b) => b.count - a.count);

  const byCountryMap = new Map<string, Map<string, number>>();
  for (const r of rows) {
    if (!r.country_code) continue;
    let bucket = byCountryMap.get(r.country_code);
    if (!bucket) {
      bucket = new Map();
      byCountryMap.set(r.country_code, bucket);
    }
    bucket.set(r.option_id, (bucket.get(r.option_id) ?? 0) + 1);
  }

  const byCountry: CountryAggregate[] = Array.from(byCountryMap.entries())
    .map(([country, optMap]) => {
      const total = Array.from(optMap.values()).reduce((acc, n) => acc + n, 0);
      const options = Array.from(optMap.entries())
        .map(([optionId, count]) => ({
          optionId,
          count,
          percent: percent(count, total),
        }))
        .sort((a, b) => b.count - a.count);
      return { country, total, options };
    })
    .sort((a, b) => b.total - a.total);

  return { global, byCountry };
}
