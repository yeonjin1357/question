import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { QuestionCard } from "@/components/question/QuestionCard";
import { Card } from "@/components/ui/Card";
import { getTodayQuestion } from "@/lib/db/queries/questions";
import { getMyResponse } from "@/lib/db/queries/responses";
import { getAggregates } from "@/lib/db/queries/results";
import { computeSessionHash } from "@/lib/session/hash";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const today = await getTodayQuestion(locale);
  if (!today) return {};

  const ogUrl = `/api/og/${today.question.id}`;
  return {
    title: today.question.text,
    description: today.question.text,
    openGraph: {
      title: today.question.text,
      description: today.question.text,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: today.question.text,
      description: today.question.text,
      images: [ogUrl],
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const today = await getTodayQuestion(locale);

  if (!today) {
    return (
      <main id="main-content" className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-6 px-5 py-16 text-center sm:px-8">
        <span aria-hidden className="text-6xl">🌱</span>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("app.title")}
        </h1>
        <p className="max-w-md text-base text-neutral-600 dark:text-neutral-400">
          {t("question.noQuestionToday")}
        </p>
      </main>
    );
  }

  const hdrs = await headers();
  const ip =
    hdrs.get("cf-connecting-ip") ?? hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = hdrs.get("user-agent") ?? "unknown";
  const sessionHash = computeSessionHash(ip, ua);
  const myResponse = await getMyResponse(today.question.id, sessionHash);

  const initialResults = myResponse ? await getAggregates(today.question.id) : null;

  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 pb-16 pt-6 sm:px-8 sm:pt-10"
    >
      <Card variant="elevated" padded className="animate-pop-in">
        <QuestionCard today={today} myResponse={myResponse} initialResults={initialResults} />
      </Card>
    </main>
  );
}
