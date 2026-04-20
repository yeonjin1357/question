"use client";

import { useEffect, useRef, useState } from "react";

import type { AggregateResult } from "@/lib/db/queries/results";

const POLL_INTERVAL_MS = 15_000;

export interface UseLiveResultsState {
  results: AggregateResult;
  /** true 이면 결과가 주기적으로 새로고침되고 있음을 의미 (LIVE 인디케이터용). */
  isLive: boolean;
  /** 가장 최근 polling 성공 시각 (ms). 로컬 표기 가능. */
  lastUpdatedAt: number | null;
}

export interface UseLiveResultsOptions {
  /** 훅을 실제로 돌릴지. false 이면 initial 만 노출. */
  enabled?: boolean;
  /** 테스트용 오버라이드. */
  intervalMs?: number;
}

/** 다음 UTC 자정까지 ms. 음수 방지. */
function msUntilNextUtcMidnight(now: Date = new Date()): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(0, next - now.getTime());
}

/**
 * `/api/results/:id` 를 주기적으로 폴링해서 최신 집계를 유지.
 *
 * 중단 조건:
 *   - `enabled === false`
 *   - 탭이 hidden (visibilitychange 리스너)
 *   - UTC 00:00 이후 (질문 교체 — 옛 데이터 계속 갱신할 필요 없음)
 *   - 컴포넌트 언마운트
 *
 * 요청 중복 방지:
 *   - AbortController 로 이전 요청 취소
 *   - inflight flag 로 interval 과 visibility 콜백 동시 트리거 시 중복 차단
 */
export function useLiveResults(
  questionId: string,
  initial: AggregateResult,
  opts: UseLiveResultsOptions = {},
): UseLiveResultsState {
  const { enabled = true, intervalMs = POLL_INTERVAL_MS } = opts;
  const [results, setResults] = useState<AggregateResult>(initial);
  const [isLive, setIsLive] = useState(enabled);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const inflightRef = useRef<AbortController | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setIsLive(false);
      return;
    }
    stoppedRef.current = false;
    setIsLive(true);

    const poll = async () => {
      if (stoppedRef.current) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      if (inflightRef.current) return;

      const ctrl = new AbortController();
      inflightRef.current = ctrl;
      try {
        const res = await fetch(`/api/results/${questionId}`, {
          signal: ctrl.signal,
          cache: "no-store",
        });
        if (res.ok) {
          const body = (await res.json()) as { data: AggregateResult };
          setResults(body.data);
          setLastUpdatedAt(Date.now());
        }
        // 429 등 실패는 조용히 무시 — 다음 interval 에서 재시도
      } catch {
        // abort / 네트워크 오류 무시
      } finally {
        if (inflightRef.current === ctrl) inflightRef.current = null;
      }
    };

    const timer = setInterval(poll, intervalMs);

    const onVisibility = () => {
      if (document.visibilityState === "visible") void poll();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // UTC 자정에 자동 중단 — 쿼스천이 회전하므로 옛 id 계속 폴링할 의미 없음
    const stopTimer = setTimeout(() => {
      stoppedRef.current = true;
      setIsLive(false);
      inflightRef.current?.abort();
    }, msUntilNextUtcMidnight());

    return () => {
      clearInterval(timer);
      clearTimeout(stopTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      inflightRef.current?.abort();
      inflightRef.current = null;
      stoppedRef.current = true;
    };
  }, [questionId, enabled, intervalMs]);

  return { results, isLive, lastUpdatedAt };
}

export const __testUtils = { msUntilNextUtcMidnight };
