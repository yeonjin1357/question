"use client";

import { useTranslations } from "next-intl";

import { formatHms, useCountdown } from "@/hooks/useCountdown";

export function CountdownBanner() {
  const t = useTranslations();
  const c = useCountdown();

  // SSR/hydration 단계에선 자리만 잡고 마운트 후 시간 표시.
  const time = c ? formatHms(c) : "--:--:--";

  return (
    <p className="text-center text-xs tabular-nums text-neutral-500">
      {t("countdown.nextQuestionIn", { time })}
    </p>
  );
}
