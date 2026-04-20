import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  return { title: t("title") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const steps = [
    {
      emoji: "🌍",
      title: t("about.step1Title"),
      body: t("about.step1Body"),
    },
    {
      emoji: "👆",
      title: t("about.step2Title"),
      body: t("about.step2Body"),
    },
    {
      emoji: "📊",
      title: t("about.step3Title"),
      body: t("about.step3Body"),
    },
  ];

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-5 py-8 sm:px-8"
    >
      <header className="flex flex-col items-start gap-3">
        <span aria-hidden className="text-5xl">
          🌱
        </span>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("about.title")}
        </h1>
        <p className="text-lg text-neutral-700 dark:text-neutral-300">{t("about.subtitle")}</p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold">{t("about.howItWorksTitle")}</h2>
        <ol className="grid gap-3 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={i}>
              <Card variant="elevated" padded className="h-full !p-5">
                <div className="flex flex-col gap-2">
                  <span aria-hidden className="text-3xl">
                    {s.emoji}
                  </span>
                  <span className="font-display text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                    Step {i + 1}
                  </span>
                  <h3 className="font-display text-base font-semibold">{s.title}</h3>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">{s.body}</p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <Card variant="soft" padded>
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-semibold">
            🔒 {t("about.privacyTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
            {t("about.privacyBody")}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              href={`/${locale}/privacy`}
              className="rounded-full bg-white px-3 py-1 text-brand-700 hover:bg-brand-100 dark:bg-neutral-900 dark:text-brand-300 dark:hover:bg-neutral-800"
            >
              {t("legal.privacy")} →
            </Link>
            <Link
              href={`/${locale}/terms`}
              className="rounded-full bg-white px-3 py-1 text-brand-700 hover:bg-brand-100 dark:bg-neutral-900 dark:text-brand-300 dark:hover:bg-neutral-800"
            >
              {t("legal.terms")} →
            </Link>
          </div>
        </div>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold">🌐 {t("about.languagesTitle")}</h2>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {t("about.languagesBody")}
        </p>
      </section>

      <div className="flex justify-center pt-4">
        <Link href={`/${locale}`}>
          <Button size="lg" rightIcon={<span aria-hidden>→</span>}>
            {t("about.cta")}
          </Button>
        </Link>
      </div>
    </main>
  );
}
