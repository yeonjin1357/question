import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { z } from "zod";

import { getQuestionById } from "@/lib/db/queries/questions";
import { getAggregates } from "@/lib/db/queries/results";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

const paramSchema = z.object({ id: z.uuid() });
const searchSchema = z.object({
  opt: z.uuid().optional(),
  country: z
    .string()
    .regex(/^[A-Z]{2}$/)
    .optional(),
});

type SharePageSearch = { opt?: string; country?: string };

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<SharePageSearch>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const sp = await searchParams;
  const idParsed = paramSchema.safeParse({ id });
  if (!idParsed.success) return {};

  const question = await getQuestionById(idParsed.data.id, locale);
  if (!question) return {};

  const ogParams = new URLSearchParams();
  if (sp.opt) ogParams.set("opt", sp.opt);
  const ogQuery = ogParams.toString();
  const ogUrl = `/api/og/${idParsed.data.id}${ogQuery ? `?${ogQuery}` : ""}`;

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

export default async function SharePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<SharePageSearch>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const idParsed = paramSchema.safeParse({ id });
  if (!idParsed.success) notFound();

  const raw = await searchParams;
  const sp = searchSchema.safeParse(raw);
  const highlightOpt = sp.success ? sp.data.opt : undefined;
  const highlightCountry = sp.success ? sp.data.country : undefined;

  const t = await getTranslations();
  const question = await getQuestionById(idParsed.data.id, locale);
  if (!question) notFound();

  const aggregates = await getAggregates(idParsed.data.id);
  const globalMap = new Map(aggregates.global.map((g) => [g.optionId, g]));
  const totalVotes = aggregates.global.reduce((s, g) => s + g.count, 0);

  return (
    <main id="main-content" className="mx-auto flex min-h-screen max-w-2xl flex-col items-stretch gap-10 p-8 pt-16">
      <header className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-neutral-500">
          {t("app.title")}
        </span>
        <span className="text-xs text-neutral-400">{question.question.publishDate}</span>
      </header>

      <h1 className="text-balance text-center text-3xl font-bold leading-tight sm:text-4xl">
        {question.question.text}
      </h1>

      <ul className="flex w-full flex-col gap-3">
        {question.options.map((o) => {
          const ag = globalMap.get(o.id);
          const pct = ag?.percent ?? 0;
          const isHighlight = o.id === highlightOpt;
          return (
            <li key={o.id}>
              <div
                className={cn(
                  "relative overflow-hidden rounded-lg border px-4 py-3",
                  isHighlight ? "border-neutral-900" : "border-neutral-300",
                )}
              >
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 transition-all",
                    isHighlight ? "bg-neutral-900" : "bg-neutral-200",
                  )}
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
                <div className="relative flex items-center justify-between">
                  <span
                    className={cn(
                      "text-base",
                      isHighlight ? "font-semibold text-white mix-blend-difference" : "text-neutral-900",
                    )}
                  >
                    {o.text}
                  </span>
                  <span className="relative text-sm tabular-nums text-neutral-600">{pct}%</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-center text-sm text-neutral-500">
        {t("results.totalParticipants", { count: totalVotes })}
        {highlightCountry ? ` · ${highlightCountry}` : null}
      </p>

      <Link
        href={`/${locale}`}
        className="self-center rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-700"
      >
        {t("cta.answer")} →
      </Link>
    </main>
  );
}
