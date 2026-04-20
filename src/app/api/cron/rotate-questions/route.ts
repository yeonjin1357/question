import { type NextRequest, NextResponse } from "next/server";

import { rotateQuestionStatuses } from "@/lib/db/queries/rotation";
import { createServerSupabase } from "@/lib/db/server";
import { env } from "@/lib/env";
import { errorResponse } from "@/lib/http/errors";
import { captureException } from "@/lib/monitoring/capture";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * 매일 UTC 00:00 에 Vercel Cron 이 호출하는 라우트.
 * `vercel.json` 에 스케줄을 정의하고, `CRON_SECRET` env 가 설정돼 있으면
 * Vercel 이 자동으로 `authorization: Bearer <CRON_SECRET>` 헤더를 붙여 호출합니다.
 *
 * 수동 트리거(디버그용) 시 동일 헤더로 curl 가능:
 *   curl -H "authorization: Bearer $CRON_SECRET" https://.../api/cron/rotate-questions
 *
 * `GET` 과 `POST` 모두 지원. Vercel Cron 은 현재 GET.
 */
async function handle(req: NextRequest): Promise<NextResponse> {
  const secret = env.CRON_SECRET;
  if (!secret) {
    return errorResponse("INTERNAL_ERROR", "Cron is not configured (CRON_SECRET missing).");
  }

  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  // timing-safe 비교가 이상적이나 Node 18+ Web Crypto 에 구현 없음.
  // secret 자체가 길면 timing attack 리스크는 실질적 위협이 안 됨.
  if (header !== expected) {
    return errorResponse("FORBIDDEN", "Invalid cron secret.");
  }

  try {
    const db = createServerSupabase();
    const result = await rotateQuestionStatuses(db);
    // 관찰성: 당일 scheduled 질문이 없었다면 WARN 남김 — 런칭 초기 큐 소진 알림용.
    if (result.promoted === 0 && result.liveQuestionId === null) {
      // eslint-disable-next-line no-console
      console.warn(
        `[cron/rotate-questions] no scheduled question for ${result.todayUtc}; live queue empty`,
      );
    }
    return NextResponse.json({ data: result });
  } catch (err) {
    captureException(err, { tags: { route: "cron/rotate-questions" } });
    return errorResponse("INTERNAL_ERROR", "Rotation failed.");
  }
}

export const GET = handle;
export const POST = handle;
