import { type NextRequest, NextResponse } from "next/server";

import { getTodayQuestion } from "@/lib/db/queries/questions";
import { getMyResponse } from "@/lib/db/queries/responses";
import { errorResponse } from "@/lib/http/errors";
import { pickLocale, secondsUntilNextUtcMidnight } from "@/lib/http/locale";
import { rateLimitFromRequest } from "@/lib/ratelimit";
import { computeSessionHash } from "@/lib/session/hash";
import { extractClientIp, extractUserAgent } from "@/lib/session/request";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limit = rateLimitFromRequest(req, { key: "today", windowSeconds: 60, max: 60 });
  if (!limit.ok) {
    return errorResponse("RATE_LIMITED", "Too many requests.", undefined, {
      headers: { "retry-after": String(limit.retryAfterSeconds) },
    });
  }

  const url = new URL(req.url);
  const locale = pickLocale(url, req.headers.get("accept-language"));

  const today = await getTodayQuestion(locale);
  if (!today) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "No live question today." } },
      { status: 404 },
    );
  }

  const sessionHash = computeSessionHash(extractClientIp(req), extractUserAgent(req));
  const myResponse = await getMyResponse(today.question.id, sessionHash);

  return NextResponse.json(
    {
      data: {
        question: today.question,
        options: today.options,
        myResponse,
        secondsUntilNext: secondsUntilNextUtcMidnight(),
        isTranslationFallback: today.isTranslationFallback,
      },
    },
    {
      headers: {
        // myResponse 가 사용자별이므로 CDN 공유 캐시 금지.
        // 브라우저에서만 1분 캐시 + 5분 SWR.
        "cache-control": "private, max-age=60, stale-while-revalidate=300",
      },
    },
  );
}
