import { type NextRequest, NextResponse } from "next/server";

import { countRecentSuggestionsByIp, insertSuggestion } from "@/lib/db/queries/suggestions";
import { errorResponse } from "@/lib/http/errors";
import { rateLimitFromRequest } from "@/lib/ratelimit";
import { computeSessionHash } from "@/lib/session/hash";
import { extractClientIp, extractUserAgent } from "@/lib/session/request";
import { isLikelySpam } from "@/lib/validation/spam";
import { suggestQuestionSchema } from "@/lib/validation/suggestion";

export const dynamic = "force-dynamic";

const MAX_SUGGESTIONS_PER_DAY = 3;

export async function POST(req: NextRequest) {
  // 1) Process-local burst limit (초당 수준 스팸 억제)
  const burst = rateLimitFromRequest(req, {
    key: "suggestions:burst",
    windowSeconds: 60,
    max: 5,
  });
  if (!burst.ok) {
    return errorResponse("RATE_LIMITED", "Too many requests.", undefined, {
      headers: { "retry-after": String(burst.retryAfterSeconds) },
    });
  }

  // 2) 바디 파싱 + Zod 검증
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Request body must be valid JSON.");
  }
  const parsed = suggestQuestionSchema.safeParse(raw);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid request body.", parsed.error.issues);
  }

  // 3) 스팸 필터
  if (
    isLikelySpam(parsed.data.questionText) ||
    parsed.data.options.some((o) => isLikelySpam(o.text))
  ) {
    return errorResponse("VALIDATION_ERROR", "Content rejected by spam filter.");
  }

  // 4) IP 해시로 24h 제출 수 체크 (DB 기반 long-window 리밋)
  const ipHash = computeSessionHash(extractClientIp(req), extractUserAgent(req));
  const recent = await countRecentSuggestionsByIp(ipHash);
  if (recent >= MAX_SUGGESTIONS_PER_DAY) {
    return errorResponse(
      "RATE_LIMITED",
      "Daily suggestion limit reached. Try again tomorrow.",
      undefined,
      { headers: { "retry-after": String(24 * 60 * 60) } },
    );
  }

  // 5) 저장
  const options = parsed.data.options.map((o, i) => ({ text: o.text, sortOrder: i + 1 }));
  const inserted = await insertSuggestion({
    questionText: parsed.data.questionText,
    options,
    locale: parsed.data.locale,
    submitterEmail: parsed.data.submitterEmail ?? null,
    ipHash,
  });
  if (!inserted) {
    return errorResponse("INTERNAL_ERROR", "Failed to save suggestion.");
  }

  return NextResponse.json(
    { data: { id: inserted.id, status: "pending" } },
    { status: 201 },
  );
}
