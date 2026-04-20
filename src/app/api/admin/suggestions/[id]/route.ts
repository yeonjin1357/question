import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createQuestionFromSuggestion, updateSuggestionStatus } from "@/lib/db/queries/admin";
import { createServerSupabase } from "@/lib/db/server";
import { errorResponse } from "@/lib/http/errors";

export const dynamic = "force-dynamic";

const pathSchema = z.object({ id: z.uuid() });

const rejectSchema = z.object({
  action: z.literal("reject"),
  adminNote: z.string().max(500).optional(),
});

const approveSchema = z.object({
  action: z.literal("approve"),
  publishDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.string().min(1).max(32),
  /** 옵션적으로 원문 수정 */
  text: z.string().trim().min(3).max(200).optional(),
  options: z
    .array(z.object({ text: z.string().trim().min(1).max(50) }))
    .min(2)
    .max(4)
    .optional(),
});

const patchSchema = z.discriminatedUnion("action", [approveSchema, rejectSchema]);

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const idParsed = pathSchema.safeParse(ctx.params);
  if (!idParsed.success) return errorResponse("VALIDATION_ERROR", "Invalid id.");

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Invalid JSON.");
  }
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid body.", parsed.error.issues);
  }

  if (parsed.data.action === "reject") {
    const ok = await updateSuggestionStatus(idParsed.data.id, {
      status: "rejected",
      adminNote: parsed.data.adminNote ?? null,
    });
    if (!ok) return errorResponse("INTERNAL_ERROR", "Update failed.");
    return NextResponse.json({ data: { id: idParsed.data.id, status: "rejected" } });
  }

  // approve → suggestion 조회 후 question/translations/options 생성
  const db = createServerSupabase();
  const { data: suggestion } = await db
    .from("suggestions")
    .select("question_text, options_json, locale, status")
    .eq("id", idParsed.data.id)
    .maybeSingle();

  if (!suggestion) return errorResponse("NOT_FOUND", "Suggestion not found.");
  if (suggestion.status !== "pending") {
    return errorResponse("VALIDATION_ERROR", "Suggestion is not pending.");
  }

  const finalText = parsed.data.text ?? suggestion.question_text;
  const suggestedOptions = Array.isArray(suggestion.options_json)
    ? (suggestion.options_json as Array<{ text: string; sortOrder?: number }>)
    : [];
  const finalOptions = (parsed.data.options ?? suggestedOptions.map((o) => ({ text: o.text })))
    .map((o, i) => ({ text: o.text, sortOrder: i + 1 }));

  const result = await createQuestionFromSuggestion({
    suggestionId: idParsed.data.id,
    publishDate: parsed.data.publishDate,
    category: parsed.data.category,
    text: finalText,
    locale: suggestion.locale,
    options: finalOptions,
  });

  if ("error" in result) {
    return errorResponse("INTERNAL_ERROR", result.error);
  }

  return NextResponse.json(
    {
      data: {
        id: idParsed.data.id,
        status: "approved",
        questionId: result.questionId,
      },
    },
    { status: 201 },
  );
}
