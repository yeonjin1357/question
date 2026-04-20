"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const STORAGE_KEY = "oqad:cookie-notice-ack";

export function CookieNotice() {
  const t = useTranslations("legal");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") {
        setVisible(true);
      }
    } catch {
      // localStorage 차단 환경에선 배너 숨김
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
      className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm shadow-pop dark:bg-neutral-900 sm:inset-x-auto sm:right-4 sm:max-w-md"
    >
      <span aria-hidden>🍪</span>
      <p className="flex-1 text-xs text-neutral-700 dark:text-neutral-300">
        {t("cookieNoticeBody")}
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("cookieNoticeAck")}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
      >
        <X size={16} />
      </button>
    </div>
  );
}
