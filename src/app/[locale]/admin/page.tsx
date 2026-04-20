import { setRequestLocale } from "next-intl/server";

import { AdminSuggestionList } from "@/components/admin/AdminSuggestionList";
import { Chip } from "@/components/ui/Chip";
import { listSuggestionsByStatus } from "@/lib/db/queries/admin";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin" };

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const tab: "pending" | "approved" | "rejected" =
    sp.status === "approved" || sp.status === "rejected" ? sp.status : "pending";

  const items = await listSuggestionsByStatus(tab);

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8"
    >
      <header className="flex flex-col gap-1">
        <span className="font-display text-xs font-medium uppercase tracking-widest text-brand-600">
          🔒 Admin
        </span>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Suggestions queue</h1>
      </header>

      <nav className="flex flex-wrap gap-2">
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <a
            key={s}
            href={`/${locale}/admin?status=${s}`}
            aria-current={tab === s ? "page" : undefined}
          >
            <Chip tone="brand" active={tab === s}>
              {s} {tab === s ? `(${items.length})` : ""}
            </Chip>
          </a>
        ))}
      </nav>

      <AdminSuggestionList items={items} locale={locale} />
    </main>
  );
}
