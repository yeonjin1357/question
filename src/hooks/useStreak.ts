"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "oqad:streak";
const MILESTONES = [3, 7, 14, 30, 100] as const;

export interface StreakState {
  /** 연속 참여 일수. localStorage 미지원/미데이터 시 0. */
  count: number;
  /** 가장 최근에 답한 질문의 publishDate (YYYY-MM-DD, UTC). */
  last: string | null;
  /** 이 렌더에서 막 마일스톤(3/7/14/30/100)에 도달했는지. */
  justHitMilestone: number | null;
}

interface Stored {
  last: string;
  count: number;
}

function diffDaysUtc(aIso: string, bIso: string): number {
  const a = Date.parse(`${aIso}T00:00:00Z`);
  const b = Date.parse(`${bIso}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
  return Math.round((b - a) / 86_400_000);
}

/** 순수 함수로 분리. 테스트 가능. */
export function computeNextStreak(
  prev: Stored | null,
  publishDate: string,
): { stored: Stored; hitMilestone: number | null } | { noop: true; current: Stored } {
  if (!prev) {
    const stored = { last: publishDate, count: 1 };
    return { stored, hitMilestone: null };
  }
  if (prev.last === publishDate) {
    return { noop: true, current: prev };
  }
  const gap = diffDaysUtc(prev.last, publishDate);
  const count = gap === 1 ? prev.count + 1 : 1;
  const stored = { last: publishDate, count };
  const hit = (MILESTONES as readonly number[]).includes(count) ? count : null;
  return { stored, hitMilestone: hit };
}

function readStored(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "last" in parsed &&
      "count" in parsed &&
      typeof (parsed as Stored).last === "string" &&
      typeof (parsed as Stored).count === "number"
    ) {
      return parsed as Stored;
    }
  } catch {
    // ignore
  }
  return null;
}

function writeStored(next: Stored) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // best effort
  }
}

/**
 * 매일 한 질문 참여 연속 기록. 모든 상태는 로컬 localStorage 에만 저장 — 서버 미연동.
 *
 * 동작:
 *   - 같은 날 재방문 → 증가 없음, 현재 카운트 유지.
 *   - 어제 답한 뒤 오늘 답 → +1.
 *   - 2일 이상 공백 → 1로 초기화.
 *
 * `record(publishDate)` 는 컴포넌트가 "답한 상태" 를 처음 진입할 때 1회 호출합니다.
 */
export function useStreak(): StreakState & { record: (publishDate: string) => void } {
  const [state, setState] = useState<StreakState>({
    count: 0,
    last: null,
    justHitMilestone: null,
  });

  useEffect(() => {
    const s = readStored();
    if (s) setState({ count: s.count, last: s.last, justHitMilestone: null });
  }, []);

  const record = useCallback((publishDate: string) => {
    const prev = readStored();
    const result = computeNextStreak(prev, publishDate);

    if ("noop" in result) {
      setState({ count: result.current.count, last: result.current.last, justHitMilestone: null });
      return;
    }

    writeStored(result.stored);
    setState({
      count: result.stored.count,
      last: result.stored.last,
      justHitMilestone: result.hitMilestone,
    });
  }, []);

  return { ...state, record };
}
