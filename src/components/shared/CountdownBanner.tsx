"use client";

import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

import { formatHms, useCountdown } from "@/hooks/useCountdown";

export function CountdownBanner() {
  const t = useTranslations();
  const c = useCountdown();

  const time = c ? formatHms(c) : "--:--:--";

  return (
    <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs text-neutral-700 shadow-soft dark:bg-neutral-900 dark:text-neutral-300">
      <Clock size={14} aria-hidden className="text-brand-500 animate-bounce-sm" />
      <span className="tabular-nums">{t("countdown.nextQuestionIn", { time })}</span>
    </div>
  );
}
