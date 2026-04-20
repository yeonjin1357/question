"use client";

import { useEffect, useState } from "react";

export interface Countdown {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

function msUntilNextUtcMidnight(now: Date): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(0, next - now.getTime());
}

/**
 * 다음 UTC 자정까지의 카운트다운.
 * 서버 렌더 시엔 null 반환 (hydration mismatch 회피) — 마운트 후 매초 업데이트.
 */
export function useCountdown(): Countdown | null {
  const [value, setValue] = useState<Countdown | null>(null);

  useEffect(() => {
    const tick = () => {
      const ms = msUntilNextUtcMidnight(new Date());
      const total = Math.floor(ms / 1000);
      setValue({
        hours: Math.floor(total / 3600),
        minutes: Math.floor((total % 3600) / 60),
        seconds: total % 60,
        totalSeconds: total,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return value;
}

export function formatHms({ hours, minutes, seconds }: Countdown): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
