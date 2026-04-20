import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/Button";

export default async function LocaleNotFound() {
  const locale = await getLocale();
  const t = await getTranslations();
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-5 px-5 py-16 text-center sm:px-8"
    >
      <span aria-hidden className="text-6xl">
        🔍
      </span>
      <p className="font-display text-xs font-semibold uppercase tracking-widest text-brand-600">
        404
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {t("error.notFoundTitle")}
      </h1>
      <p className="max-w-md text-base text-neutral-600 dark:text-neutral-400">{t("error.notFoundBody")}</p>
      <Link href={`/${locale}`}>
        <Button variant="primary" size="lg">
          {t("cta.backToHome")}
        </Button>
      </Link>
    </main>
  );
}
