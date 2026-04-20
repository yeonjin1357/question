"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";

interface ShareButtonProps {
  questionId: string;
  questionText?: string;
  optionId?: string | null;
  countryCode?: string | null;
  className?: string;
}

/**
 * 공유 버튼. 우선순위:
 *   1. navigator.share (모바일/PWA/최신 브라우저 네이티브 공유 시트)
 *   2. navigator.clipboard.writeText (링크 복사)
 *   3. Twitter intent (팝업 새 창)
 *
 * 공유 URL: `/{locale}/share/{questionId}?opt=...&country=...`
 * 이 URL 에 OG 메타가 심어져 있어 소셜 카드 프리뷰가 렌더됩니다.
 */
export function ShareButton({
  questionId,
  questionText,
  optionId,
  countryCode,
  className,
}: ShareButtonProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [feedback, setFeedback] = useState<"copied" | null>(null);

  function buildShareUrl(): string {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://example.com";
    const u = new URL(`/${locale}/share/${questionId}`, origin);
    if (optionId) u.searchParams.set("opt", optionId);
    if (countryCode) u.searchParams.set("country", countryCode);
    return u.toString();
  }

  async function handleShare() {
    const url = buildShareUrl();
    const title = questionText ?? "One Question a Day";

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // 사용자가 취소했거나 share 실패 → 클립보드 폴백
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setFeedback("copied");
      setTimeout(() => setFeedback(null), 2000);
      return;
    } catch {
      // 클립보드 미지원 → Twitter intent 로 최종 폴백
      const intent = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
      window.open(intent, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(
        "rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium transition",
        "hover:border-neutral-500 hover:bg-neutral-50",
        "focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2",
        className,
      )}
    >
      {feedback === "copied" ? t("cta.shareCopied") : t("cta.share")}
    </button>
  );
}
