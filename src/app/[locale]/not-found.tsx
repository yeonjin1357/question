import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

export default async function LocaleNotFound() {
  const locale = await getLocale();
  const t = await getTranslations();
  return (
    <main id="main-content" className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 p-8 text-center">
      <p className="text-xs uppercase tracking-widest text-neutral-500">404</p>
      <h1 className="text-3xl font-bold tracking-tight">{t("error.notFoundTitle")}</h1>
      <p className="text-base text-neutral-600 dark:text-neutral-400">
        {t("error.notFoundBody")}
      </p>
      <Link
        href={`/${locale}`}
        className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
      >
        {t("cta.backToHome")}
      </Link>
    </main>
  );
}
