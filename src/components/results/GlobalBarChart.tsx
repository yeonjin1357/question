"use client";

import { useTranslations } from "next-intl";

import type { OptionAggregate } from "@/lib/db/queries/results";
import { cn } from "@/lib/utils/cn";

interface GlobalBarChartProps {
  aggregate: OptionAggregate[];
  /** optionId → 표시 텍스트 매핑 */
  optionLabel: Record<string, string>;
  /** 내가 고른 옵션 (강조) */
  myOptionId: string | null;
  /** 참여자 수 */
  totalCount: number;
}

/**
 * 옵션별 퍼센트를 수평 바로 렌더링하는 간단한 차트.
 *
 * 이전엔 recharts 를 썼지만 수평 바 하나에 95KB+ 를 번들에 싣는 건 과하다 판단.
 * 순수 Tailwind 로 교체 (T-052). 동일 스타일이 `src/app/[locale]/archive/[date]/page.tsx`
 * 에도 반복되는데 현 시점엔 중복 허용 — 세 번째로 나타나면 공용화 검토.
 */
export function GlobalBarChart({
  aggregate,
  optionLabel,
  myOptionId,
  totalCount,
}: GlobalBarChartProps) {
  const t = useTranslations();

  const rows = aggregate.map((row) => ({
    optionId: row.optionId,
    label: optionLabel[row.optionId] ?? row.optionId.slice(0, 6),
    percent: row.percent,
    count: row.count,
  }));

  return (
    <section
      aria-label="Global results"
      className="flex w-full flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4"
    >
      <header className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">{t("results.global")}</h2>
        <span className="text-xs text-neutral-500">
          {t("results.totalParticipants", { count: totalCount })}
        </span>
      </header>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-500">{t("results.noDataYet")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => {
            const isMine = r.optionId === myOptionId;
            return (
              <li key={r.optionId}>
                <div className="relative overflow-hidden rounded-md border border-neutral-200 px-3 py-2">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 transition-all",
                      isMine ? "bg-neutral-900" : "bg-neutral-300",
                    )}
                    style={{ width: `${r.percent}%` }}
                    aria-hidden
                  />
                  <div className="relative flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "truncate text-sm",
                        isMine ? "font-semibold text-white mix-blend-difference" : "text-neutral-900",
                      )}
                    >
                      {r.label}
                    </span>
                    <span
                      className={cn(
                        "whitespace-nowrap text-xs tabular-nums",
                        isMine ? "text-white mix-blend-difference" : "text-neutral-600",
                      )}
                    >
                      {r.percent}% ({r.count})
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
