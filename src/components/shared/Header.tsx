import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export async function Header({ locale }: { locale: string }) {
  const t = await getTranslations();
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/60 bg-white/70 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-950/70">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3 sm:px-8">
        <Link href={`/${locale}`} className="flex items-center rounded-full" aria-label="OneQ home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href={`/${locale}/archive`}
            className="rounded-full px-3 py-1.5 text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-neutral-300 dark:hover:bg-brand-950/40 dark:hover:text-brand-300"
          >
            {t("archive.title")}
          </Link>
          <Link
            href={`/${locale}/suggest`}
            className="rounded-full px-3 py-1.5 text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-neutral-300 dark:hover:bg-brand-950/40 dark:hover:text-brand-300"
          >
            {t("suggest.title")}
          </Link>
          <ThemeToggle label={t("a11y.toggleTheme")} />
        </nav>
      </div>
    </header>
  );
}
