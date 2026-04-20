import "server-only";

import { createServerSupabase } from "@/lib/db/server";

export async function insertSuggestion(params: {
  questionText: string;
  options: Array<{ text: string; sortOrder: number }>;
  locale: string;
  submitterEmail: string | null;
  ipHash: string;
}): Promise<{ id: string } | null> {
  const db = createServerSupabase();
  const { data, error } = await db
    .from("suggestions")
    .insert({
      question_text: params.questionText,
      options_json: params.options,
      locale: params.locale,
      submitter_email: params.submitterEmail,
      ip_hash: params.ipHash,
    })
    .select("id")
    .single();

  if (error || !data) return null;
  return { id: data.id };
}

/**
 * 최근 24시간에 이 IP 해시로 제출된 suggestions 수. 3 건 이상이면 레이트 리밋.
 */
export async function countRecentSuggestionsByIp(ipHash: string): Promise<number> {
  const db = createServerSupabase();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await db
    .from("suggestions")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  return count ?? 0;
}
