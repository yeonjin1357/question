import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SearchBox } from "@/components/archive/SearchBox";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { getArchive } from "@/lib/db/queries/archive";
import { categoryEmoji } from "@/lib/ui/category-emoji";

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
  searchParams: Promise<{ category?: string; cursor?: string; q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const category = CATEGORIES.includes(sp.category as (typeof CATEGORIES)[number])
    ? sp.category
    : undefined;
  const searchRaw = sp.q?.trim() ?? "";
  const search = searchRaw.length >= 2 ? searchRaw : undefined;

  const t = await getTranslations();
  const page = await getArchive({
    locale,
    cursor: sp.cursor,
    limit: 20,
    category,
    search,
  });

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-5 py-8 sm:px-8"
    >
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("archive.title")}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          🗂️ Every question, every day.
        </p>
      </header>

      <SearchBox
        placeholder={t("archive.searchPlaceholder")}
        clearLabel={t("archive.searchClear")}
      />

      <nav aria-label="Category filter" className="flex flex-wrap gap-2">
        <CategoryChipLink locale={locale} current={category} value={undefined} label={t("archive.all")} />
        {CATEGORIES.map((c) => (
          <CategoryChipLink key={c} locale={locale} current={category} value={c} label={c} />
        ))}
      </nav>

      {page.items.length === 0 ? (
        <Card variant="flat" padded className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          {search ? (
            <>
              <span aria-hidden className="mb-2 block text-3xl">
                🔍
              </span>
              {t("archive.searchNoResults", { q: searchRaw })}
            </>
          ) : (
            t("archive.noItems")
          )}
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {page.items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/${locale}/archive/${item.publishDate}`}
                className="group block h-full rounded-3xl bg-white p-5 shadow-soft transition-all hover:shadow-pop dark:bg-neutral-900"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span aria-hidden className="text-xl">
                    {categoryEmoji(item.category)}
                  </span>
                  <Chip tone="accent">{item.category}</Chip>
                  <time
                    dateTime={item.publishDate}
                    className="ml-auto text-xs text-neutral-400 tabular-nums dark:text-neutral-500"
                  >
                    {item.publishDate}
                  </time>
                </div>
                <p className="font-display text-lg font-medium leading-snug text-neutral-900 group-hover:text-brand-700 dark:text-neutral-100 dark:group-hover:text-brand-400">
                  {item.text}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="tabular-nums">
                    {t("results.totalParticipants", { count: item.totalResponses })}
                  </span>
                  {item.topCountry ? (
                    <>
                      <span aria-hidden>·</span>
                      <span>{t("archive.topCountryPrefix", { country: item.topCountry })}</span>
                    </>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {page.nextCursor ? (
        <div className="flex justify-center pt-2">
          <Link
            href={{
              pathname: `/${locale}/archive`,
              query: {
                ...(category ? { category } : {}),
                ...(search ? { q: search } : {}),
                cursor: page.nextCursor,
              },
            }}
          >
            <Button variant="secondary" size="md">
              {t("cta.loadMore")} →
            </Button>
          </Link>
        </div>
      ) : null}
    </main>
  );
}

function CategoryChipLink({
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
  const emoji = value ? categoryEmoji(value) : null;
  return (
    <Link
      href={{
        pathname: `/${locale}/archive`,
        query: value ? { category: value } : {},
      }}
      aria-current={isActive ? "page" : undefined}
    >
      <Chip tone="brand" active={isActive} icon={emoji ? <span>{emoji}</span> : undefined}>
        {label}
      </Chip>
    </Link>
  );
}
