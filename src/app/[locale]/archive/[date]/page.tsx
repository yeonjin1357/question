import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { z } from "zod";

import { ShareButton } from "@/components/shared/ShareButton";
import { getArchiveByDate } from "@/lib/db/queries/archive";
import { getQuestionById } from "@/lib/db/queries/questions";
import { getAggregates } from "@/lib/db/queries/results";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

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

  // 국가별 최다 선택 국가 (단순 통계용)
  const topCountry = aggregates.byCountry[0]?.country ?? null;

  return (
    <main id="main-content" className="mx-auto flex min-h-screen max-w-2xl flex-col items-stretch gap-10 p-8 pt-16">
      <header className="flex flex-col gap-2">
        <Link
          href={`/${locale}/archive`}
          className="text-xs text-neutral-500 hover:text-neutral-800"
        >
          {t("cta.backToArchive")}
        </Link>
        <span className="flex items-center gap-3 text-xs uppercase tracking-widest text-neutral-500">
          <time dateTime={question.question.publishDate}>{question.question.publishDate}</time>
          <span>·</span>
          <span>{question.question.category}</span>
        </span>
      </header>

      <h1 className="text-balance text-3xl font-bold leading-tight sm:text-4xl">
        {question.question.text}
      </h1>

      <ul className="flex w-full flex-col gap-3">
        {question.options.map((o) => {
          const ag = globalMap.get(o.id);
          const pct = ag?.percent ?? 0;
          return (
            <li key={o.id}>
              <div className="relative overflow-hidden rounded-lg border border-neutral-300 px-4 py-3">
                <div
                  className="absolute inset-y-0 left-0 bg-neutral-200"
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
                <div className="relative flex items-center justify-between">
                  <span className={cn("text-base text-neutral-900")}>{o.text}</span>
                  <span className="relative text-sm tabular-nums text-neutral-600">{pct}%</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-sm text-neutral-500">
        {t("results.totalParticipants", { count: totalVotes })}
        {topCountry
          ? ` · ${t("archive.topCountryPrefix", { country: topCountry })}`
          : null}
      </p>

      <div className="flex justify-center">
        <ShareButton questionId={archive.id} questionText={question.question.text} />
      </div>
    </main>
  );
}
