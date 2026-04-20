import { type NextRequest, NextResponse } from "next/server";

import { insertResponse } from "@/lib/db/queries/responses";
import { getAggregates } from "@/lib/db/queries/results";
import { createServerSupabase } from "@/lib/db/server";
import { getCountryFromRequest } from "@/lib/geo/country";
import { ANSWERED_COOKIE_MAX_AGE_SECONDS, answeredCookieName } from "@/lib/http/cookies";
import { errorResponse } from "@/lib/http/errors";
import { rateLimitFromRequest } from "@/lib/ratelimit";
import { computeSessionHash } from "@/lib/session/hash";
import { extractClientIp, extractUserAgent } from "@/lib/session/request";
import { submitResponseSchema } from "@/lib/validation/response";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limit = rateLimitFromRequest(req, { key: "responses", windowSeconds: 60, max: 5 });
  if (!limit.ok) {
    return errorResponse("RATE_LIMITED", "Too many requests.", undefined, {
      headers: { "retry-after": String(limit.retryAfterSeconds) },
    });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Request body must be valid JSON.");
  }

  const parsed = submitResponseSchema.safeParse(rawBody);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid request body.", parsed.error.issues);
  }
  const { questionId, optionId } = parsed.data;

  const db = createServerSupabase();
  const [{ data: question }, { data: option }] = await Promise.all([
    db.from("questions").select("id, status").eq("id", questionId).maybeSingle(),
    db.from("options").select("id, question_id").eq("id", optionId).maybeSingle(),
  ]);

  if (!question) {
    return errorResponse("NOT_FOUND", "Question not found.");
  }
  if (question.status !== "live") {
    return errorResponse("VALIDATION_ERROR", "Question is not accepting responses.");
  }
  if (!option || option.question_id !== questionId) {
    return errorResponse("VALIDATION_ERROR", "Option does not belong to this question.");
  }

  const sessionHash = computeSessionHash(extractClientIp(req), extractUserAgent(req));
  const countryCode = getCountryFromRequest(req);

  const outcome = await insertResponse({ questionId, optionId, countryCode, sessionHash });

  if (!outcome.ok && outcome.code === "DUPLICATE") {
    return errorResponse("DUPLICATE_RESPONSE", "You already answered today's question.", {
      previousOptionId: outcome.previousOptionId,
    });
  }
  if (!outcome.ok) {
    console.error("[/api/responses] insert failed:", outcome.message);
    return errorResponse("INTERNAL_ERROR", "Failed to record response.");
  }

  const results = await getAggregates(questionId);

  const res = NextResponse.json(
    {
      data: {
        response: { id: outcome.id, optionId },
        results,
      },
    },
    { status: 201 },
  );

  // Layer 2 중복 방어. 1년 유지 (ADR-003).
  res.cookies.set(answeredCookieName(questionId), optionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ANSWERED_COOKIE_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
