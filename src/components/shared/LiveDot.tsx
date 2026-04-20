"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils/cn";

interface LiveDotProps {
  active: boolean;
  className?: string;
}

/**
 * 녹색 pulse 점 + "LIVE" 라벨. `active=false` 면 회색 점만.
 * 폴링이 돌아가고 있음을 시각적으로 알리는 용도.
 */
export function LiveDot({ active, className }: LiveDotProps) {
  const t = useTranslations();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest",
        active ? "text-green-700 dark:text-green-400" : "text-neutral-400 dark:text-neutral-600",
        className,
      )}
      aria-live="polite"
      aria-label={active ? t("results.liveOn") : t("results.liveOff")}
    >
      <span className="relative flex h-2 w-2">
        {active ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
        ) : null}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            active ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600",
          )}
        />
      </span>
      <span>{active ? t("results.liveOn") : t("results.liveOff")}</span>
    </span>
  );
}
