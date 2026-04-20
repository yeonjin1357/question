import { getTranslations } from "next-intl/server";

import { QuestionFlow } from "@/components/question/QuestionFlow";
import { Chip } from "@/components/ui/Chip";
import type { TodayQuestion } from "@/lib/db/queries/questions";
import type { AggregateResult } from "@/lib/db/queries/results";
import { categoryEmoji } from "@/lib/ui/category-emoji";

interface QuestionCardProps {
  today: TodayQuestion;
  myResponse: { optionId: string } | null;
  initialResults: AggregateResult | null;
}

export async function QuestionCard({ today, myResponse, initialResults }: QuestionCardProps) {
  const t = await getTranslations();
  const emoji = categoryEmoji(today.question.category);

  return (
    <section className="flex w-full flex-col gap-7">
      <header className="flex flex-col items-start gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="brand" active icon={<span>⭐</span>}>
            {t("home.todaysQuestion")}
          </Chip>
          <Chip tone="accent" icon={<span>{emoji}</span>}>
            {today.question.category}
          </Chip>
          <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">
            {today.question.publishDate}
          </span>
        </div>

        <h1 className="text-balance font-display text-[28px] font-semibold leading-[1.15] tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl">
          {today.question.text}
        </h1>

        {today.isTranslationFallback ? (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {t("question.translationFallback")}
          </p>
        ) : null}
      </header>

      <QuestionFlow
        questionId={today.question.id}
        questionText={today.question.text}
        publishDate={today.question.publishDate}
        options={today.options}
        initialMyResponse={myResponse}
        initialResults={initialResults}
      />
    </section>
  );
}
