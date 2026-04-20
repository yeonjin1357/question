import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { getMyHistory } from "@/lib/db/queries/history";
import { computeSessionHash } from "@/lib/session/hash";
import { categoryEmoji } from "@/lib/ui/category-emoji";
import { optionEmoji } from "@/lib/ui/option-emoji";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("history");
  return { title: t("title") };
}

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const hdrs = await headers();
  const ip =
    hdrs.get("cf-connecting-ip") ?? hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = hdrs.get("user-agent") ?? "unknown";
  const sessionHash = computeSessionHash(ip, ua);
  const items = await getMyHistory(sessionHash, locale);

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-5 py-8 sm:px-8"
    >
      <header className="flex flex-col gap-2">
        <span aria-hidden className="text-4xl">
          📜
        </span>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("history.title")}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{t("history.subtitle")}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-500">{t("history.privacyNote")}</p>
      </header>

      {items.length === 0 ? (
        <Card variant="flat" padded className="flex flex-col items-center gap-3 text-center">
          <span aria-hidden className="text-5xl">
            🌱
          </span>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t("history.empty")}</p>
          <Link href={`/${locale}`}>
            <Button size="md">{t("cta.answer")} →</Button>
          </Link>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const catEmoji = categoryEmoji(item.category);
            const optEmoji = optionEmoji(item.myOptionId);
            return (
              <li key={`${item.questionId}:${item.answeredAt}`}>
                <Link
                  href={`/${locale}/archive/${item.publishDate}`}
                  className="group block h-full rounded-3xl bg-white p-5 shadow-soft transition-all hover:shadow-pop dark:bg-neutral-900"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span aria-hidden className="text-xl">
                      {catEmoji}
                    </span>
                    <Chip tone="accent">{item.category}</Chip>
                    <time
                      dateTime={item.publishDate}
                      className="ml-auto text-xs text-neutral-400 tabular-nums dark:text-neutral-500"
                    >
                      {item.publishDate}
                    </time>
                  </div>
                  <p className="mb-3 font-display text-lg font-medium leading-snug text-neutral-900 group-hover:text-brand-700 dark:text-neutral-100 dark:group-hover:text-brand-400">
                    {item.questionText || "—"}
                  </p>
                  <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-800 dark:bg-brand-950/40 dark:text-brand-300">
                    {optEmoji ? <span aria-hidden>{optEmoji}</span> : null}
                    <span className="font-medium">
                      {t("history.youAnswered", { text: item.myOptionText })}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
