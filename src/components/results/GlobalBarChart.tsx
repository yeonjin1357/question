"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/Badge";
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

const LETTERS = ["A", "B", "C", "D", "E"];

export function GlobalBarChart({
  aggregate,
  optionLabel,
  myOptionId,
  totalCount,
}: GlobalBarChartProps) {
  const t = useTranslations();

  const rows = aggregate.map((row, idx) => ({
    optionId: row.optionId,
    label: optionLabel[row.optionId] ?? row.optionId.slice(0, 6),
    percent: row.percent,
    count: row.count,
    letter: LETTERS[idx] ?? String(idx + 1),
  }));

  return (
    <section
      aria-label="Global results"
      className="flex w-full flex-col gap-4 rounded-3xl bg-white p-5 shadow-soft sm:p-6"
    >
      <header className="flex items-end justify-between">
        <h2 className="font-display text-base font-semibold">{t("results.global")}</h2>
        <div className="text-right">
          <div className="font-display text-2xl font-semibold text-brand-600 tabular-nums">
            {totalCount.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500">
            {t("results.totalParticipants", { count: totalCount })}
          </div>
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-500">{t("results.noDataYet")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => {
            const isMine = r.optionId === myOptionId;
            return (
              <li key={r.optionId}>
                <div className="flex items-center gap-3">
                  <Badge tone={isMine ? "brand" : "neutral"}>{r.letter}</Badge>
                  <div className="flex-1">
                    <div className="mb-1 flex items-baseline justify-between gap-3">
                      <span
                        className={cn(
                          "truncate text-sm",
                          isMine ? "font-semibold text-brand-700" : "text-neutral-800",
                        )}
                      >
                        {r.label}
                      </span>
                      <span
                        className={cn(
                          "whitespace-nowrap font-display text-base font-semibold tabular-nums",
                          isMine ? "text-brand-600" : "text-neutral-600",
                        )}
                      >
                        {r.percent}%
                      </span>
                    </div>
                    <div
                      className="relative h-2.5 w-full overflow-hidden rounded-full bg-neutral-100"
                      aria-hidden
                    >
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                          isMine
                            ? "bg-gradient-to-r from-brand-400 to-brand-500"
                            : "bg-neutral-300",
                        )}
                        style={{ width: `${Math.max(r.percent, 2)}%` }}
                      />
                    </div>
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
