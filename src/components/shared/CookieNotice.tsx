"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const STORAGE_KEY = "oqad:cookie-notice-ack";

/**
 * 쿠키 고지 배너.
 *
 * 사이트는 "strictly necessary" 쿠키(세션 식별용)만 사용하므로 GDPR 상 동의가
 * 법적으로 필수는 아니나, 투명성 차원에서 한 번 안내 후 localStorage 플래그로 다시 띄우지 않음.
 *
 * localStorage 접근은 클라이언트 전용이라 마운트 후 체크하며, 최초 프레임엔 렌더하지 않아
 * SSR/hydration 미스매치를 피함.
 */
export function CookieNotice() {
  const t = useTranslations("legal");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") {
        setVisible(true);
      }
    } catch {
      // localStorage 차단(Safari 프라이빗 모드 등)에선 배너 숨김 처리
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // best effort
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-3 bottom-3 z-40 flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4 text-sm shadow-md sm:inset-x-auto sm:right-4 sm:max-w-md"
    >
      <p className="flex-1 text-neutral-700">{t("cookieNoticeBody")}</p>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
      >
        {t("cookieNoticeAck")}
      </button>
    </div>
  );
}
