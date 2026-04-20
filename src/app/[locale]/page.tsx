import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { QuestionCard } from "@/components/question/QuestionCard";
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
      <main id="main-content" className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("app.title")}</h1>
        <p className="max-w-md text-center text-base">{t("question.noQuestionToday")}</p>
      </main>
    );
  }

  // 서버에서 직접 세션 해시로 myResponse 조회 — 페이지 첫 렌더에 이미 "답했는지" 반영.
  const hdrs = await headers();
  const ip =
    hdrs.get("cf-connecting-ip") ?? hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = hdrs.get("user-agent") ?? "unknown";
  const sessionHash = computeSessionHash(ip, ua);
  const myResponse = await getMyResponse(today.question.id, sessionHash);

  // 재방문 사용자에겐 초기 렌더에 이미 집계 결과를 함께 내려 깜빡임 없이 결과 표시.
  const initialResults = myResponse ? await getAggregates(today.question.id) : null;

  return (
    <main id="main-content" className="mx-auto flex min-h-screen max-w-2xl flex-col items-stretch gap-10 p-8 pt-16">
      <div className="text-center text-xs uppercase tracking-widest text-neutral-500">
        {t("app.title")}
      </div>

      <QuestionCard today={today} myResponse={myResponse} initialResults={initialResults} />
    </main>
  );
}
