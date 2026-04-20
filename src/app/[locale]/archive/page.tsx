import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { getArchive } from "@/lib/db/queries/archive";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Archive",
};

const CATEGORIES = [
  "habits",
  "food",
  "culture",
  "values",
  "tech",
  "home",
  "travel",
  "work",
  "social",
  "fun",
] as const;

export default async function ArchiveListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; cursor?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const category = CATEGORIES.includes(sp.category as (typeof CATEGORIES)[number])
    ? sp.category
    : undefined;

  const t = await getTranslations();
  const page = await getArchive({
    locale,
    cursor: sp.cursor,
    limit: 20,
    category,
  });

  return (
    <main id="main-content" className="mx-auto flex min-h-screen max-w-3xl flex-col items-stretch gap-8 p-8 pt-16">
      <header className="flex flex-col gap-3">
        <Link href={`/${locale}`} className="text-xs text-neutral-500 hover:text-neutral-800">
          ← {t("app.title")}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{t("archive.title")}</h1>
      </header>

      <nav
        aria-label="Category filter"
        className="flex flex-wrap gap-2 border-b border-neutral-200 pb-4"
      >
        <CategoryChip
          locale={locale}
          current={category}
          value={undefined}
          label={t("archive.all")}
        />
        {CATEGORIES.map((c) => (
          <CategoryChip key={c} locale={locale} current={category} value={c} label={c} />
        ))}
      </nav>

      {page.items.length === 0 ? (
        <p className="text-sm text-neutral-500">{t("archive.noItems")}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200">
          {page.items.map((item) => (
            <li key={item.id} className="py-4">
              <Link
                href={`/${locale}/archive/${item.publishDate}`}
                className="flex flex-col gap-1 hover:text-neutral-700"
              >
                <span className="flex items-center gap-3 text-xs uppercase tracking-widest text-neutral-500">
                  <time dateTime={item.publishDate}>{item.publishDate}</time>
                  <span>·</span>
                  <span>{item.category}</span>
                </span>
                <span className="text-base font-medium text-neutral-900">{item.text}</span>
                <span className="text-xs text-neutral-500">
                  {t("results.totalParticipants", { count: item.totalResponses })}
                  {item.topCountry
                    ? ` · ${t("archive.topCountryPrefix", { country: item.topCountry })}`
                    : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {page.nextCursor ? (
        <nav className="flex justify-center pt-2">
          <Link
            href={{
              pathname: `/${locale}/archive`,
              query: { ...(category ? { category } : {}), cursor: page.nextCursor },
            }}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
          >
            {t("cta.loadMore")} →
          </Link>
        </nav>
      ) : null}
    </main>
  );
}

function CategoryChip({
  locale,
  current,
  value,
  label,
}: {
  locale: string;
  current: string | undefined;
  value: string | undefined;
  label: string;
}) {
  const isActive = (current ?? null) === (value ?? null);
  return (
    <Link
      href={{
        pathname: `/${locale}/archive`,
        query: value ? { category: value } : {},
      }}
      className={
        isActive
          ? "rounded-full bg-neutral-900 px-3 py-1 text-xs text-white"
          : "rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-50"
      }
    >
      {label}
    </Link>
  );
}
