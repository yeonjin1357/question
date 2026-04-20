import { getTranslations } from "next-intl/server";

import { QuestionFlow } from "@/components/question/QuestionFlow";
import type { TodayQuestion } from "@/lib/db/queries/questions";
import type { AggregateResult } from "@/lib/db/queries/results";

interface QuestionCardProps {
  today: TodayQuestion;
  myResponse: { optionId: string } | null;
  initialResults: AggregateResult | null;
}

export async function QuestionCard({ today, myResponse, initialResults }: QuestionCardProps) {
  const t = await getTranslations();

  return (
    <section className="flex w-full flex-col items-center gap-8">
      <header className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-neutral-500">
          {today.question.publishDate}
        </span>
        <span className="text-xs text-neutral-400">{today.question.category}</span>
      </header>

      <h1 className="text-balance text-center text-3xl font-bold leading-tight sm:text-4xl">
        {today.question.text}
      </h1>

      {today.isTranslationFallback ? (
        <p className="text-xs text-neutral-500">{t("question.translationFallback")}</p>
      ) : null}

      <QuestionFlow
        questionId={today.question.id}
        questionText={today.question.text}
        options={today.options}
        initialMyResponse={myResponse}
        initialResults={initialResults}
      />
    </section>
  );
}
