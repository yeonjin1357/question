import { setRequestLocale } from "next-intl/server";

import { AdminSuggestionList } from "@/components/admin/AdminSuggestionList";
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
    <main id="main-content" className="mx-auto flex min-h-screen max-w-3xl flex-col items-stretch gap-6 p-8 pt-12">
      <header className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-widest text-neutral-500">admin</span>
        <h1 className="text-2xl font-bold">Suggestions queue</h1>
      </header>

      <nav className="flex gap-2 border-b border-neutral-200 pb-2 text-sm">
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <a
            key={s}
            href={`/${locale}/admin?status=${s}`}
            className={
              tab === s
                ? "rounded-full bg-neutral-900 px-3 py-1 text-xs text-white"
                : "rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
            }
          >
            {s} ({tab === s ? items.length : "…"})
          </a>
        ))}
      </nav>

      <AdminSuggestionList items={items} locale={locale} />
    </main>
  );
}
