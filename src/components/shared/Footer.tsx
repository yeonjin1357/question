import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations();
  return (
    <footer className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3 px-8 pb-12 pt-16 text-xs text-neutral-500">
      <Link
        href={`/${locale}/privacy`}
        className="rounded-full px-2 py-1 hover:text-brand-600"
      >
        {t("legal.privacy")}
      </Link>
      <span aria-hidden className="text-neutral-300">
        ·
      </span>
      <Link
        href={`/${locale}/terms`}
        className="rounded-full px-2 py-1 hover:text-brand-600"
      >
        {t("legal.terms")}
      </Link>
      <span aria-hidden className="text-neutral-300">
        ·
      </span>
      <span className="inline-flex items-center gap-1">
        <span aria-hidden>🌍</span> One question, every day.
      </span>
    </footer>
  );
}
