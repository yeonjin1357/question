import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getMyResponse } from "@/lib/db/queries/responses";
import { getAggregates } from "@/lib/db/queries/results";
import { answeredCookieName } from "@/lib/http/cookies";
import { errorResponse } from "@/lib/http/errors";
import { rateLimitFromRequest } from "@/lib/ratelimit";
import { computeSessionHash } from "@/lib/session/hash";
import { extractClientIp, extractUserAgent } from "@/lib/session/request";

export const dynamic = "force-dynamic";

const pathSchema = z.object({ id: z.uuid() });

export async function GET(req: NextRequest, ctx: { params: { id: string } }) {
  const limit = rateLimitFromRequest(req, { key: "results", windowSeconds: 60, max: 30 });
  if (!limit.ok) {
    return errorResponse("RATE_LIMITED", "Too many requests.", undefined, {
      headers: { "retry-after": String(limit.retryAfterSeconds) },
    });
  }

  const parsed = pathSchema.safeParse(ctx.params);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid question id.");
  }
  const questionId = parsed.data.id;

  // 접근 허용 조건: (a) Layer 2 쿠키 보유  OR  (b) 오늘의 세션 해시가 DB 와 매치.
  const cookieHit = req.cookies.get(answeredCookieName(questionId));
  let hashHit = false;
  if (!cookieHit) {
    const sessionHash = computeSessionHash(extractClientIp(req), extractUserAgent(req));
    const mine = await getMyResponse(questionId, sessionHash);
    hashHit = !!mine;
  }

  if (!cookieHit && !hashHit) {
    return errorResponse("FORBIDDEN", "Answer the question first to see results.");
  }

  const results = await getAggregates(questionId);

  return NextResponse.json(
    { data: results },
    {
      headers: {
        "cache-control": "private, max-age=30, stale-while-revalidate=60",
      },
    },
  );
}
