import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations();
  return (
    <footer className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3 px-8 pb-12 pt-16 text-xs text-neutral-500 dark:text-neutral-400">
      <Link
        href={`/${locale}/archive`}
        className="rounded-full px-2 py-1 hover:text-brand-600 dark:hover:text-brand-400 sm:hidden"
      >
        {t("archive.title")}
      </Link>
      <span aria-hidden className="text-neutral-300 dark:text-neutral-700 sm:hidden">
        ·
      </span>
      <Link
        href={`/${locale}/history`}
        className="rounded-full px-2 py-1 hover:text-brand-600 dark:hover:text-brand-400"
      >
        {t("history.navLabel")}
      </Link>
      <span aria-hidden className="text-neutral-300 dark:text-neutral-700">
        ·
      </span>
      <Link
        href={`/${locale}/suggest`}
        className="rounded-full px-2 py-1 hover:text-brand-600 dark:hover:text-brand-400 sm:hidden"
      >
        {t("suggest.title")}
      </Link>
      <span aria-hidden className="text-neutral-300 dark:text-neutral-700 sm:hidden">
        ·
      </span>
      <Link
        href={`/${locale}/privacy`}
        className="rounded-full px-2 py-1 hover:text-brand-600 dark:hover:text-brand-400"
      >
        {t("legal.privacy")}
      </Link>
      <span aria-hidden className="text-neutral-300 dark:text-neutral-700">
        ·
      </span>
      <Link
        href={`/${locale}/terms`}
        className="rounded-full px-2 py-1 hover:text-brand-600 dark:hover:text-brand-400"
      >
        {t("legal.terms")}
      </Link>
      <span aria-hidden className="text-neutral-300 dark:text-neutral-700">
        ·
      </span>
      <span className="inline-flex items-center gap-1">
        <span aria-hidden>🌍</span> One question, every day.
      </span>
    </footer>
  );
}
