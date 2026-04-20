"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import { GlobalBarChart } from "@/components/results/GlobalBarChart";
import { CountdownBanner } from "@/components/shared/CountdownBanner";
import { ShareButton } from "@/components/shared/ShareButton";
import type { AggregateResult } from "@/lib/db/queries/results";

// 세계지도는 react-simple-maps + world-atlas (40KB+ gzipped) 를 번들링합니다.
// 결과 화면까지 내려가지 않는 사용자에게는 이 비용을 지우지 않기 위해 lazy-load.
// 지도는 브라우저 전용 렌더라 SSR 스킵 가능.
const WorldMap = dynamic(
  () => import("@/components/results/WorldMap").then((m) => m.WorldMap),
  {
    ssr: false,
    loading: () => (
      <div
        aria-busy="true"
        className="flex h-64 w-full items-center justify-center rounded-lg border border-neutral-200 bg-white"
      >
        <div
          className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"
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
}

export function ResultsView({
  results,
  options,
  myOptionId,
  questionId,
  questionText,
}: ResultsViewProps) {
  const t = useTranslations();

  const optionLabel = Object.fromEntries(options.map((o) => [o.id, o.text]));
  const myOptionText = optionLabel[myOptionId] ?? "";
  const total = results.global.reduce((sum, r) => sum + r.count, 0);

  const sortedOptions = [...options].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex w-full flex-col gap-6">
      <div
        role="status"
        aria-live="polite"
        className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-center text-sm text-neutral-700"
      >
        {t("results.yourAnswer", { text: myOptionText })}
      </div>

      <GlobalBarChart
        aggregate={results.global}
        optionLabel={optionLabel}
        myOptionId={myOptionId}
        totalCount={total}
      />

      <WorldMap byCountry={results.byCountry} optionOrder={sortedOptions} />

      <div className="flex items-center justify-center gap-3">
        <ShareButton
          questionId={questionId}
          questionText={questionText}
          optionId={myOptionId}
        />
      </div>

      <CountdownBanner />
    </div>
  );
}
