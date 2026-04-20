import "server-only";

import type { NextRequest } from "next/server";

import { extractClientIp } from "@/lib/session/request";

/**
 * 프로세스별 인메모리 고정 윈도우 레이트 리미터.
 *
 * 한계:
 *   - Vercel 서버리스처럼 프로세스가 여러 개 뜨면 각 프로세스가 독립 카운터를 가집니다.
 *     완벽한 글로벌 제한 아님 (ADR-007).
 *   - 프로세스 재시작 시 카운터 초기화.
 *
 * 용도: 단일 리전/프로세스의 명백한 남용 억제. 글로벌 한도는 Phase 2 의 Upstash Redis 도입.
 */

const DEFAULT_MAX_ENTRIES = 10_000;

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

function evictIfNeeded(max: number) {
  if (store.size <= max) return;
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
  while (store.size > max) {
    const firstKey = store.keys().next().value;
    if (!firstKey) break;
    store.delete(firstKey);
  }
}

export interface RateLimitOptions {
  /** 윈도우 길이 (초). */
  windowSeconds: number;
  /** 윈도우 내 허용 최대 요청 수. */
  max: number;
  /** 리소스 식별자 — 라우트/엔드포인트별로 분리된 카운터. */
  key: string;
  /** 저장소 최대 엔트리. 테스트용 오버라이드. */
  maxEntries?: number;
}

export interface RateLimitResult {
  ok: boolean;
  /** 429 Retry-After 값에 사용 */
  retryAfterSeconds: number;
  /** 남은 요청 수 */
  remaining: number;
}

export function rateLimit(clientKey: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const storeKey = `${opts.key}:${clientKey}`;
  const entry = store.get(storeKey);

  if (!entry || entry.resetAt <= now) {
    store.set(storeKey, { count: 1, resetAt: now + opts.windowSeconds * 1000 });
    evictIfNeeded(opts.maxEntries ?? DEFAULT_MAX_ENTRIES);
    return { ok: true, retryAfterSeconds: 0, remaining: opts.max - 1 };
  }

  if (entry.count >= opts.max) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  entry.count += 1;
  return { ok: true, retryAfterSeconds: 0, remaining: opts.max - entry.count };
}

export function rateLimitFromRequest(req: NextRequest, opts: RateLimitOptions): RateLimitResult {
  return rateLimit(extractClientIp(req), opts);
}

/** 테스트 전용: 내부 상태 초기화. */
export function __resetRateLimitStore(): void {
  store.clear();
}
