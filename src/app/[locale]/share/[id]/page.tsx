import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { z } from "zod";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { getQuestionById } from "@/lib/db/queries/questions";
import { getAggregates } from "@/lib/db/queries/results";
import { categoryEmoji } from "@/lib/ui/category-emoji";
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
const LETTERS = ["A", "B", "C", "D", "E"];

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
  const emoji = categoryEmoji(question.question.category);

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-5 py-8 sm:px-8"
    >
      <Card variant="elevated" padded className="flex flex-col gap-6 animate-pop-in">
        <header className="flex flex-wrap items-center gap-2">
          <Chip tone="accent" icon={<span>{emoji}</span>}>
            {question.question.category}
          </Chip>
          <time
            dateTime={question.question.publishDate}
            className="ml-auto text-xs text-neutral-400 tabular-nums"
          >
            {question.question.publishDate}
          </time>
        </header>

        <h1 className="text-balance font-display text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl">
          {question.question.text}
        </h1>

        <ul className="flex w-full flex-col gap-3">
          {question.options.map((o, idx) => {
            const ag = globalMap.get(o.id);
            const pct = ag?.percent ?? 0;
            const isHighlight = o.id === highlightOpt;
            return (
              <li key={o.id} className="flex items-center gap-3">
                <Badge tone={isHighlight ? "brand" : "neutral"}>
                  {LETTERS[idx] ?? String(idx + 1)}
                </Badge>
                <div className="flex-1">
                  <div className="mb-1 flex items-baseline justify-between gap-3">
                    <span
                      className={cn(
                        "text-sm",
                        isHighlight ? "font-semibold text-brand-700" : "text-neutral-800",
                      )}
                    >
                      {o.text}
                    </span>
                    <span
                      className={cn(
                        "whitespace-nowrap font-display text-base font-semibold tabular-nums",
                        isHighlight ? "text-brand-600" : "text-neutral-600",
                      )}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div
                    className="relative h-2.5 w-full overflow-hidden rounded-full bg-neutral-100"
                    aria-hidden
                  >
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                        isHighlight
                          ? "bg-gradient-to-r from-brand-400 to-brand-500"
                          : "bg-neutral-300",
                      )}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="text-center text-xs text-neutral-500">
          {t("results.totalParticipants", { count: totalVotes })}
          {highlightCountry ? ` · ${highlightCountry}` : null}
        </p>
      </Card>

      <div className="flex justify-center">
        <Link href={`/${locale}`}>
          <Button size="lg" rightIcon={<span aria-hidden>→</span>}>
            {t("cta.answer")}
          </Button>
        </Link>
      </div>
    </main>
  );
}
