"use client";

import { Check } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { GlobalBarChart } from "@/components/results/GlobalBarChart";
import { CountdownBanner } from "@/components/shared/CountdownBanner";
import { ShareButton } from "@/components/shared/ShareButton";
import type { AggregateResult } from "@/lib/db/queries/results";

const WorldMap = dynamic(
  () => import("@/components/results/WorldMap").then((m) => m.WorldMap),
  {
    ssr: false,
    loading: () => (
      <div
        aria-busy="true"
        className="flex h-64 w-full items-center justify-center rounded-3xl bg-white shadow-soft"
      >
        <div
          className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500"
          aria-hidden
        />
      </div>
    ),
  },
);

interface ResultsViewProps {
  results: AggregateResult;
  options: Array<{ id: string; text: string; sortOrder: number }>;
  myOptionId: string;
  questionId: string;
  questionText: string;
  celebrate?: boolean;
}

export function ResultsView({
  results,
  options,
  myOptionId,
  questionId,
  questionText,
  celebrate = false,
}: ResultsViewProps) {
  const t = useTranslations();

  useEffect(() => {
    if (!celebrate) return;
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("canvas-confetti");
        if (cancelled) return;
        const confetti = mod.default;
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.35 },
          colors: ["#f97316", "#fb923c", "#fdba74", "#fde68a"],
          disableForReducedMotion: true,
        });
      } catch {
        // confetti 로드 실패해도 치명적이지 않음
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [celebrate]);

  const optionLabel = Object.fromEntries(options.map((o) => [o.id, o.text]));
  const myOptionText = optionLabel[myOptionId] ?? "";
  const total = results.global.reduce((sum, r) => sum + r.count, 0);

  const sortedOptions = [...options].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex w-full flex-col gap-5">
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-900"
      >
        <span
          aria-hidden
          className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-white"
        >
          <Check size={16} strokeWidth={3} />
        </span>
        <span className="font-medium">{t("results.yourAnswer", { text: myOptionText })}</span>
      </div>

      <GlobalBarChart
        aggregate={results.global}
        optionLabel={optionLabel}
        myOptionId={myOptionId}
        totalCount={total}
      />

      <WorldMap byCountry={results.byCountry} optionOrder={sortedOptions} />

      <div className="flex flex-col items-center gap-4 pt-2">
        <ShareButton questionId={questionId} questionText={questionText} optionId={myOptionId} />
        <CountdownBanner />
      </div>
    </div>
  );
}
