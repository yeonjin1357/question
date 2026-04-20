"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { useStreak } from "@/hooks/useStreak";

interface StreakChipProps {
  /** 답한 질문의 publishDate (YYYY-MM-DD UTC). */
  publishDate: string;
}

/**
 * 결과 화면에 뜨는 Streak 카운터.
 * 마운트 시점에 한 번 `record` 호출 → localStorage 갱신 후 배지 표시.
 */
export function StreakChip({ publishDate }: StreakChipProps) {
  const t = useTranslations();
  const { count, justHitMilestone, record } = useStreak();

  useEffect(() => {
    record(publishDate);
  }, [publishDate, record]);

  if (count <= 0) return null;

  const isMilestone = justHitMilestone !== null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
      className="inline-flex items-center gap-2 self-start rounded-full bg-gradient-to-r from-brand-400 to-brand-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-soft"
    >
      <Flame size={14} aria-hidden />
      <span className="font-display font-semibold tabular-nums">
        {isMilestone
          ? t("streak.milestone", { count })
          : t("streak.daysInARow", { count })}
      </span>
    </motion.div>
  );
}
