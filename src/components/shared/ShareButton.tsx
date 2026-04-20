"use client";

import { Check, Share2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/Button";

interface ShareButtonProps {
  questionId: string;
  questionText?: string;
  optionId?: string | null;
  countryCode?: string | null;
  className?: string;
}

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
        // 취소/실패 → 클립보드 폴백
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setFeedback("copied");
      setTimeout(() => setFeedback(null), 2000);
      return;
    } catch {
      const intent = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
      window.open(intent, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <Button
      onClick={handleShare}
      variant="primary"
      size="md"
      leftIcon={feedback === "copied" ? <Check size={16} /> : <Share2 size={16} />}
      className={className}
    >
      {feedback === "copied" ? t("cta.shareCopied") : t("cta.share")}
    </Button>
  );
}
