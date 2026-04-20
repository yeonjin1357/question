"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/Badge";
import type { OptionAggregate } from "@/lib/db/queries/results";
import { optionEmoji } from "@/lib/ui/option-emoji";
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
    emoji: optionEmoji(row.optionId),
  }));

  return (
    <section
      aria-label="Global results"
      className="flex w-full flex-col gap-4 rounded-3xl bg-white p-5 shadow-soft dark:bg-neutral-900 sm:p-6"
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
        <p className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {t("results.noDataYet")}
        </p>
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
                          "flex items-center gap-1.5 truncate text-sm",
                          isMine
                            ? "font-semibold text-brand-700 dark:text-brand-300"
                            : "text-neutral-800 dark:text-neutral-200",
                        )}
                      >
                        {r.emoji ? (
                          <span aria-hidden className="text-base leading-none">
                            {r.emoji}
                          </span>
                        ) : null}
                        <span className="truncate">{r.label}</span>
                      </span>
                      <span
                        className={cn(
                          "whitespace-nowrap font-display text-base font-semibold tabular-nums",
                          isMine
                            ? "text-brand-600 dark:text-brand-400"
                            : "text-neutral-600 dark:text-neutral-400",
                        )}
                      >
                        {r.percent}%
                      </span>
                    </div>
                    <div
                      className="relative h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
                      aria-hidden
                    >
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                          isMine
                            ? "bg-gradient-to-r from-brand-400 to-brand-500"
                            : "bg-neutral-300 dark:bg-neutral-600",
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
