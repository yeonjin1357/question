import { createHash } from "node:crypto";

import { env } from "@/lib/env";

/**
 * 특정 날짜(UTC 기준) + SESSION_HASH_SECRET 으로 만든 솔트.
 * 날짜가 바뀌면 솔트도 바뀌므로 같은 사용자의 어제/오늘 해시가 서로 달라집니다 —
 * 개인 추적이 아니라 "오늘의 중복 응답"만 막기 위한 설계.
 *
 * @see docs/ARCHITECTURE.md §5.2
 */
export function getDailySalt(date: Date = new Date()): string {
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `${env.SESSION_HASH_SECRET}|${yyyymmdd}`;
}

/**
 * 응답 중복 방지용 세션 해시. SHA-256(ip | ua | dailySalt) 의 hex (64 자).
 *
 * - 같은 (ip, ua) 라도 날짜가 바뀌면 다른 해시가 나옴 — 의도된 설계
 * - IP/UA 원문은 DB 에 저장하지 않고 해시만 저장
 */
export function computeSessionHash(ip: string, ua: string, date: Date = new Date()): string {
  const salt = getDailySalt(date);
  return createHash("sha256").update(`${ip}|${ua}|${salt}`).digest("hex");
}
