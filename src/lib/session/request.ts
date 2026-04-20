import "server-only";

import type { NextRequest } from "next/server";

/**
 * 요청에서 클라이언트 IP 를 추출합니다. 우선순위:
 *   1. `cf-connecting-ip` (Cloudflare)
 *   2. `x-forwarded-for` 의 첫 번째 토큰
 *   3. `"unknown"` (세션 해시 계산엔 문제없지만 NAT 뒤 사용자들이 같은 해시를 공유하게 됨)
 */
export function extractClientIp(req: NextRequest): string {
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return "unknown";
}

/**
 * 요청의 User-Agent 헤더. 비어 있으면 `"unknown"`.
 * 원문을 DB 에 저장하지 말고 세션 해시 계산에만 사용하세요.
 */
export function extractUserAgent(req: NextRequest): string {
  return req.headers.get("user-agent") ?? "unknown";
}
