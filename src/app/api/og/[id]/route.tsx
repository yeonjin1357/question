import { ImageResponse } from "next/og";
import { z } from "zod";

import { getQuestionById } from "@/lib/db/queries/questions";
import { getAggregates } from "@/lib/db/queries/results";

export const runtime = "edge";

const paramSchema = z.object({ id: z.uuid() });

const CANVAS_W = 1200;
const CANVAS_H = 630;
const BG = "#ffffff";
const TEXT = "#111827";
const MUTED = "#6b7280";
const BAR_BG = "#f3f4f6";
const BAR_HIGHLIGHT = "#111827";
const BAR_MUTED = "#9ca3af";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function asNode(jsx: any): React.ReactElement {
  return jsx as React.ReactElement;
}

/**
 * `GET /api/og/[id]?opt=...&country=...`
 *
 * 알림:
 *   - Satori 는 기본으로 Latin 글리프만 제공합니다. CJK 폰트를 번들 없이 Edge 에서
 *     런타임 로드하려면 Google Fonts 가 TTF 를 제공해야 하는데 현재는 WOFF/EOT 만
 *     반환하므로, MVP 단계에선 **OG 이미지는 영어 번역으로 고정 렌더**합니다.
 *     사용자 UI 언어가 한국어여도 공유 카드는 영어로 나갑니다.
 *   - CJK 대응은 T-052 성능/폴리싱 시 (a) 경량 TTF 번들 또는
 *     (b) 서브셋 기반 자체 폰트 서비스 도입으로 해결 예정.
 */
export async function GET(req: Request, ctx: { params: { id: string } }) {
  const parsed = paramSchema.safeParse(ctx.params);
  if (!parsed.success) {
    return new Response("Invalid id", { status: 400 });
  }

  const url = new URL(req.url);
  const highlightOpt = url.searchParams.get("opt");

  const [question, aggregates] = await Promise.all([
    getQuestionById(parsed.data.id, "en"),
    getAggregates(parsed.data.id),
  ]);

  if (!question) {
    return new Response("Not found", { status: 404 });
  }

  const globalMap = new Map(aggregates.global.map((g) => [g.optionId, g]));
  const totalVotes = aggregates.global.reduce((sum, g) => sum + g.count, 0);

  return new ImageResponse(
    asNode(
      <div
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: BG,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            color: MUTED,
            fontSize: 20,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          <span>One Question a Day</span>
          <span style={{ fontSize: 16 }}>{question.question.publishDate}</span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 52,
            fontWeight: 700,
            color: TEXT,
            lineHeight: 1.2,
          }}
        >
          {question.question.text}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {question.options.map((o) => {
            const ag = globalMap.get(o.id);
            const pct = ag?.percent ?? 0;
            const isHighlight = o.id === highlightOpt;
            return (
              <div
                key={o.id}
                style={{ display: "flex", alignItems: "center", gap: 18, width: "100%" }}
              >
                <div
                  style={{
                    display: "flex",
                    width: 280,
                    fontSize: 24,
                    color: isHighlight ? TEXT : MUTED,
                    fontWeight: isHighlight ? 700 : 400,
                  }}
                >
                  {o.text}
                </div>
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    height: 36,
                    backgroundColor: BAR_BG,
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: `${pct}%`,
                      height: "100%",
                      backgroundColor: isHighlight ? BAR_HIGHLIGHT : BAR_MUTED,
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    width: 80,
                    justifyContent: "flex-end",
                    fontSize: 24,
                    color: MUTED,
                  }}
                >
                  {pct}%
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            color: MUTED,
            fontSize: 18,
          }}
        >
          <span>{totalVotes.toLocaleString()} responses worldwide</span>
          <span>oqad.app</span>
        </div>
      </div>,
    ),
    { width: CANVAS_W, height: CANVAS_H },
  );
}
