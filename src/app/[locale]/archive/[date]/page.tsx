import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { z } from "zod";

import { ShareButton } from "@/components/shared/ShareButton";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { getArchiveByDate } from "@/lib/db/queries/archive";
import { getQuestionById } from "@/lib/db/queries/questions";
import { getAggregates } from "@/lib/db/queries/results";
import { categoryEmoji } from "@/lib/ui/category-emoji";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const LETTERS = ["A", "B", "C", "D", "E"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; date: string }>;
}): Promise<Metadata> {
  const { locale, date } = await params;
  const parsed = dateSchema.safeParse(date);
  if (!parsed.success) return {};

  const archive = await getArchiveByDate(parsed.data);
  if (!archive) return {};

  const question = await getQuestionById(archive.id, locale);
  if (!question) return {};

  const ogUrl = `/api/og/${archive.id}`;
  return {
    title: question.question.text,
    description: question.question.text,
    openGraph: {
      title: question.question.text,
      description: question.question.text,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: question.question.text,
      description: question.question.text,
      images: [ogUrl],
    },
  };
}

export default async function ArchiveDetailPage({
  params,
}: {
  params: Promise<{ locale: string; date: string }>;
}) {
  const { locale, date } = await params;
  setRequestLocale(locale);

  const parsed = dateSchema.safeParse(date);
  if (!parsed.success) notFound();

  const t = await getTranslations();
  const archive = await getArchiveByDate(parsed.data);
  if (!archive) notFound();

  const [question, aggregates] = await Promise.all([
    getQuestionById(archive.id, locale),
    getAggregates(archive.id),
  ]);
  if (!question) notFound();

  const globalMap = new Map(aggregates.global.map((g) => [g.optionId, g]));
  const totalVotes = aggregates.global.reduce((s, g) => s + g.count, 0);
  const topCountry = aggregates.byCountry[0]?.country ?? null;
  const emoji = categoryEmoji(question.question.category);

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-5 py-8 sm:px-8"
    >
      <Link
        href={`/${locale}/archive`}
        className="inline-flex w-fit items-center gap-1 text-xs text-neutral-500 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400"
      >
        {t("cta.backToArchive")}
      </Link>

      <Card variant="elevated" padded className="flex flex-col gap-6 animate-pop-in">
        <header className="flex flex-wrap items-center gap-2">
          <Chip tone="accent" icon={<span>{emoji}</span>}>
            {question.question.category}
          </Chip>
          <time
            dateTime={question.question.publishDate}
            className="ml-auto text-xs text-neutral-400 tabular-nums dark:text-neutral-500"
          >
            {question.question.publishDate}
          </time>
        </header>

        <h1 className="text-balance font-display text-3xl font-semibold leading-[1.15] tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl">
          {question.question.text}
        </h1>

        <ul className="flex w-full flex-col gap-3">
          {question.options.map((o, idx) => {
            const ag = globalMap.get(o.id);
            const pct = ag?.percent ?? 0;
            return (
              <li key={o.id} className="flex items-center gap-3">
                <Badge tone="neutral">{LETTERS[idx] ?? String(idx + 1)}</Badge>
                <div className="flex-1">
                  <div className="mb-1 flex items-baseline justify-between gap-3">
                    <span className="text-sm text-neutral-800 dark:text-neutral-200">{o.text}</span>
                    <span className="font-display text-base font-semibold tabular-nums text-neutral-600 dark:text-neutral-400">
                      {pct}%
                    </span>
                  </div>
                  <div
                    className="relative h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
                    aria-hidden
                  >
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full bg-neutral-300 transition-all duration-500 dark:bg-neutral-600",
                      )}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <span>
            {t("results.totalParticipants", { count: totalVotes })}
            {topCountry
              ? ` · ${t("archive.topCountryPrefix", { country: topCountry })}`
              : null}
          </span>
          <ShareButton questionId={archive.id} questionText={question.question.text} />
        </div>
      </Card>
    </main>
  );
}
