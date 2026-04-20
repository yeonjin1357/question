import "server-only";

import { createServerSupabase } from "@/lib/db/server";

export interface AdminSuggestion {
  id: string;
  questionText: string;
  options: Array<{ text: string; sortOrder?: number }>;
  locale: string;
  submitterEmail: string | null;
  status: "pending" | "approved" | "rejected";
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  scheduledFor: string | null;
}

export async function listSuggestionsByStatus(
  status: "pending" | "approved" | "rejected",
): Promise<AdminSuggestion[]> {
  const db = createServerSupabase();
  const { data } = await db
    .from("suggestions")
    .select(
      "id, question_text, options_json, locale, submitter_email, status, admin_note, created_at, reviewed_at, scheduled_for",
    )
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(100);

  return (data ?? []).map((r) => ({
    id: r.id,
    questionText: r.question_text,
    options: Array.isArray(r.options_json)
      ? (r.options_json as Array<{ text: string; sortOrder?: number }>)
      : [],
    locale: r.locale,
    submitterEmail: r.submitter_email,
    status: r.status,
    adminNote: r.admin_note,
    createdAt: r.created_at,
    reviewedAt: r.reviewed_at,
    scheduledFor: r.scheduled_for,
  }));
}

export async function updateSuggestionStatus(
  id: string,
  patch: {
    status: "approved" | "rejected";
    adminNote?: string | null;
    scheduledFor?: string | null;
  },
): Promise<boolean> {
  const db = createServerSupabase();
  const { error } = await db
    .from("suggestions")
    .update({
      status: patch.status,
      admin_note: patch.adminNote ?? null,
      scheduled_for: patch.scheduledFor ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  return !error;
}

/**
 * 승인된 제안으로부터 질문/번역/옵션을 한 번에 생성.
 * 트랜잭션 보장을 위해 RPC/stored procedure 가 이상적이지만
 * MVP 는 순차 INSERT 로 처리. 중간 실패 시 롤백 불가 — 관리자 수동 정리 필요.
 */
export async function createQuestionFromSuggestion(params: {
  suggestionId: string;
  publishDate: string;
  category: string;
  text: string;
  locale: string;
  options: Array<{ text: string; sortOrder: number }>;
}): Promise<{ questionId: string } | { error: string }> {
  const db = createServerSupabase();

  const { data: q, error: qErr } = await db
    .from("questions")
    .insert({
      publish_date: params.publishDate,
      category: params.category,
      status: "scheduled",
    })
    .select("id")
    .single();
  if (qErr || !q) return { error: qErr?.message ?? "Failed to create question" };

  const { error: qtErr } = await db
    .from("question_translations")
    .insert({ question_id: q.id, locale: params.locale, text: params.text });
  if (qtErr) return { error: qtErr.message };

  const optionRows = params.options.map((o) => ({
    question_id: q.id,
    sort_order: o.sortOrder,
  }));
  const { data: insertedOptions, error: oErr } = await db
    .from("options")
    .insert(optionRows)
    .select("id, sort_order");
  if (oErr || !insertedOptions) return { error: oErr?.message ?? "Failed to insert options" };

  const orderToId = new Map(insertedOptions.map((o) => [o.sort_order, o.id]));
  const otRows = params.options
    .map((o) => {
      const optionId = orderToId.get(o.sortOrder);
      return optionId
        ? { option_id: optionId, locale: params.locale, text: o.text }
        : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const { error: otErr } = await db.from("option_translations").insert(otRows);
  if (otErr) return { error: otErr.message };

  await updateSuggestionStatus(params.suggestionId, {
    status: "approved",
    scheduledFor: params.publishDate,
  });

  return { questionId: q.id };
}
