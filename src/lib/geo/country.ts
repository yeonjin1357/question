import type { NextRequest } from "next/server";

import { env } from "@/lib/env";

/**
 * Cloudflare 가 국가를 식별하지 못했거나 집계상 의미가 없는 특수값들.
 * - XX: unknown
 * - T1: Tor exit
 * - EU: 특정 국가를 지정할 수 없는 EU 집합
 * @see docs/ARCHITECTURE.md §6.2
 */
const INVALID_COUNTRY_CODES = new Set(["XX", "T1", "EU"]);

/**
 * ISO 3166-1 alpha-2 형태(두 글자)로 정규화. 유효하지 않으면 null.
 * 소문자 입력은 대문자로 변환.
 */
export function normalizeCountryCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const upper = raw.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return null;
  if (INVALID_COUNTRY_CODES.has(upper)) return null;
  return upper;
}

/**
 * 요청으로부터 사용자 국가 코드를 추출합니다.
 *
 * 우선순위:
 *   1. 로컬 개발 환경(NODE_ENV !== 'production')에서 DEV_COUNTRY_OVERRIDE 가 있으면 그 값
 *   2. Cloudflare 의 `cf-ipcountry` 헤더
 *
 * 프로덕션에선 반드시 Cloudflare 뒤에 배포돼 있어야 합니다.
 *
 * @returns 유효한 2 글자 국가 코드 또는 null (미식별 / 특수값)
 * @see docs/ARCHITECTURE.md §6, ADR-008
 */
export function getCountryFromRequest(req: NextRequest): string | null {
  if (env.NODE_ENV !== "production" && env.DEV_COUNTRY_OVERRIDE) {
    return normalizeCountryCode(env.DEV_COUNTRY_OVERRIDE);
  }
  return normalizeCountryCode(req.headers.get("cf-ipcountry"));
}
