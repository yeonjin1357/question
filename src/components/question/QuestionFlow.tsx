"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { ResultsView } from "@/components/results/ResultsView";
import { Badge } from "@/components/ui/Badge";
import type { AggregateResult } from "@/lib/db/queries/results";
import { optionEmoji } from "@/lib/ui/option-emoji";
import { cn } from "@/lib/utils/cn";

type Option = { id: string; sortOrder: number; text: string };

interface QuestionFlowProps {
  questionId: string;
  questionText: string;
  publishDate: string;
  options: Option[];
  initialMyResponse: { optionId: string } | null;
  initialResults: AggregateResult | null;
}

type State =
  | { kind: "idle" }
  | { kind: "submitting"; optionId: string }
  | { kind: "answered"; myOptionId: string; results: AggregateResult | null; justAnswered: boolean }
  | { kind: "error"; message: string };

const LETTERS = ["A", "B", "C", "D", "E"];

export function QuestionFlow({
  questionId,
  questionText,
  publishDate,
  options,
  initialMyResponse,
  initialResults,
}: QuestionFlowProps) {
  const t = useTranslations();
  const [state, setState] = useState<State>(
    initialMyResponse
      ? {
          kind: "answered",
          myOptionId: initialMyResponse.optionId,
          results: initialResults,
          justAnswered: false,
        }
      : { kind: "idle" },
  );

  const submit = useCallback(
    async (optionId: string) => {
      setState({ kind: "submitting", optionId });
      try {
        const res = await fetch("/api/responses", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ questionId, optionId }),
        });
        if (res.status === 201) {
          const body = (await res.json()) as {
            data: { response: { optionId: string }; results: AggregateResult };
          };
          setState({
            kind: "answered",
            myOptionId: body.data.response.optionId,
            results: body.data.results,
            justAnswered: true,
          });
          return;
        }
        if (res.status === 409) {
          const body = (await res.json().catch(() => null)) as {
            error?: { details?: { previousOptionId?: string | null } };
          } | null;
          const prev = body?.error?.details?.previousOptionId ?? optionId;
          const r = await fetch(`/api/results/${questionId}`);
          const results = r.ok ? ((await r.json()) as { data: AggregateResult }).data : null;
          setState({ kind: "answered", myOptionId: prev, results, justAnswered: false });
          return;
        }
        if (res.status === 429) {
          setState({ kind: "error", message: t("error.generic") });
          return;
        }
        setState({ kind: "error", message: t("error.generic") });
      } catch {
        setState({ kind: "error", message: t("error.generic") });
      }
    },
    [questionId, t],
  );

  if (state.kind === "answered") {
    if (!state.results) {
      return (
        <div className="flex justify-center py-8 text-sm text-neutral-500">
          {t("results.loading")}
        </div>
      );
    }
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <ResultsView
          results={state.results}
          options={options}
          myOptionId={state.myOptionId}
          questionId={questionId}
          questionText={questionText}
          publishDate={publishDate}
          celebrate={state.justAnswered}
        />
      </motion.div>
    );
  }

  const disabled = state.kind === "submitting";

  return (
    <KeyboardAwareFlow
      disabled={disabled || state.kind !== "idle" && state.kind !== "error"}
      options={options}
      onSelect={submit}
    >
      <ul className="flex w-full flex-col gap-3">
        {options.map((o, idx) => {
          const isBusy = state.kind === "submitting" && state.optionId === o.id;
          return (
            <li key={o.id}>
              <motion.button
                type="button"
                onClick={() => submit(o.id)}
                disabled={disabled}
                aria-busy={isBusy}
                whileHover={disabled ? undefined : { scale: 1.01 }}
                whileTap={disabled ? undefined : { scale: 0.98 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3.5 text-left text-base transition-colors dark:bg-neutral-900",
                  disabled
                    ? "cursor-default border-neutral-200 opacity-70 dark:border-neutral-800"
                    : "border-neutral-200 hover:border-brand-400 hover:bg-brand-50 dark:border-neutral-800 dark:hover:border-brand-500 dark:hover:bg-brand-950/40",
                  isBusy && "!border-brand-500 !bg-brand-500 !text-white",
                )}
              >
                <Badge tone={isBusy ? "brand" : "neutral"} className={isBusy ? "!bg-white !text-brand-600" : ""}>
                  {LETTERS[idx] ?? String(idx + 1)}
                </Badge>
                {(() => {
                  const emoji = optionEmoji(o.id);
                  return emoji ? (
                    <span aria-hidden className="text-xl leading-none">
                      {emoji}
                    </span>
                  ) : null;
                })()}
                <span className="flex-1 font-medium">{o.text}</span>
                {isBusy ? (
                  <span
                    aria-hidden
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                  />
                ) : (
                  <ChevronRight
                    size={18}
                    aria-hidden
                    className={disabled ? "text-neutral-300" : "text-neutral-400"}
                  />
                )}
              </motion.button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {state.kind === "error" ? (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
          >
            {state.message}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <p className="hidden text-center text-[11px] text-neutral-400 dark:text-neutral-500 sm:block">
        {t("question.keyboardHint", { max: Math.min(options.length, 5) })}
      </p>
    </KeyboardAwareFlow>
  );
}

/**
 * 1..5 숫자키로 옵션 선택. input/textarea 포커스 중엔 동작 안 함.
 * Cmd/Ctrl 조합은 브라우저 기본 단축키와 충돌하므로 제외.
 */
function KeyboardAwareFlow({
  disabled,
  options,
  onSelect,
  children,
}: {
  disabled: boolean;
  options: Option[];
  onSelect: (optionId: string) => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (disabled) return;
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > Math.min(options.length, 5)) return;
      const opt = options[n - 1];
      if (opt) {
        e.preventDefault();
        onSelect(opt.id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [disabled, options, onSelect]);

  return <div className="flex w-full flex-col gap-4">{children}</div>;
}
