import { createServerSupabase } from "@/lib/db/server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const ITEM_LIMIT = 50;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * 간단한 RSS 2.0 피드. 기본 로케일 = "en". 피드 독자는 영어로 읽는다고 가정.
 * 다국어 피드를 굳이 늘리지 않고 URL 은 `/{locale}/archive/{date}` 로 링크만 제공.
 */
export async function GET() {
  const db = createServerSupabase();
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

  const { data } = await db
    .from("questions")
    .select("id, publish_date, category, status")
    .in("status", ["live", "archived"])
    .order("publish_date", { ascending: false })
    .limit(ITEM_LIMIT);

  const rows = data ?? [];
  const ids = rows.map((r) => r.id);

  const { data: translations } =
    ids.length > 0
      ? await db
          .from("question_translations")
          .select("question_id, locale, text")
          .in("question_id", ids)
          .eq("locale", "en")
      : { data: [] as Array<{ question_id: string; locale: string; text: string }> };

  const titleByQ = new Map<string, string>();
  for (const t of translations ?? []) titleByQ.set(t.question_id, t.text);

  const items = rows
    .map((r) => {
      const title = titleByQ.get(r.id) ?? "One Question a Day";
      const link = `${base}/en/archive/${r.publish_date}`;
      const pubDate = new Date(`${r.publish_date}T00:00:00Z`).toUTCString();
      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(r.category)}</category>
      <description>${escapeXml(title)}</description>
    </item>`;
    })
    .join("\n");

  const now = new Date().toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>One Question a Day</title>
    <link>${base}</link>
    <description>One question, one day, the whole world answers.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=7200",
    },
  });
}
