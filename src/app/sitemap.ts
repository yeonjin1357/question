import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { createServerSupabase } from "@/lib/db/server";
import { env } from "@/lib/env";

const STATIC_ROUTES = ["", "/archive", "/suggest", "/privacy", "/terms"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    STATIC_ROUTES.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? ("daily" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.7,
    })),
  );

  // 아카이브된 (live/archived) 질문별 상세 페이지
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("questions")
    .select("publish_date, status")
    .in("status", ["live", "archived"])
    .order("publish_date", { ascending: false })
    .limit(500);

  const archiveEntries: MetadataRoute.Sitemap = (data ?? []).flatMap((row) =>
    routing.locales.map((locale) => ({
      url: `${base}/${locale}/archive/${row.publish_date}`,
      lastModified: row.status === "live" ? now : new Date(row.publish_date),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  );

  return [...staticEntries, ...archiveEntries];
}
