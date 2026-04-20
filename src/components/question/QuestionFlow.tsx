"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import { ResultsView } from "@/components/results/ResultsView";
import type { AggregateResult } from "@/lib/db/queries/results";
import { cn } from "@/lib/utils/cn";

type Option = { id: string; sortOrder: number; text: string };

interface QuestionFlowProps {
  questionId: string;
  questionText: string;
  options: Option[];
  initialMyResponse: { optionId: string } | null;
  initialResults: AggregateResult | null;
}

type State =
  | { kind: "idle" }
  | { kind: "submitting"; optionId: string }
  | { kind: "answered"; myOptionId: string; results: AggregateResult | null }
  | { kind: "error"; message: string };

/**
 * 질문 응답 플로우 전체를 담당하는 단일 Client Component.
 *
 * 초기 상태:
 *   - initialMyResponse 가 있으면 바로 `answered` 로 시작 (재방문 UX)
 *   - 그렇지 않으면 `idle` (버튼 표시)
 *
 * 제출 후:
 *   - 201: 서버가 반환한 results 를 그대로 사용 → 한 번의 왕복으로 결과 표시
 *   - 409: /api/results/:id 로 결과 재조회 → 이전 답과 현재 결과 표시
 *   - 기타: error 상태
 */
export function QuestionFlow({
  questionId,
  questionText,
  options,
  initialMyResponse,
  initialResults,
}: QuestionFlowProps) {
  const t = useTranslations();
  const [state, setState] = useState<State>(
    initialMyResponse
      ? { kind: "answered", myOptionId: initialMyResponse.optionId, results: initialResults }
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
          setState({ kind: "answered", myOptionId: prev, results });
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
      return <div className="text-center text-sm text-neutral-500">{t("results.loading")}</div>;
    }
    return (
      <ResultsView
        results={state.results}
        options={options}
        myOptionId={state.myOptionId}
        questionId={questionId}
        questionText={questionText}
      />
    );
  }

  const disabled = state.kind === "submitting";

  return (
    <div className="flex w-full flex-col items-stretch gap-3">
      <ul className="flex w-full flex-col gap-3">
        {options.map((o) => {
          const isBusy = state.kind === "submitting" && state.optionId === o.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => submit(o.id)}
                disabled={disabled}
                aria-busy={isBusy}
                className={cn(
                  "w-full rounded-lg border px-4 py-3 text-center text-base transition",
                  disabled
                    ? "cursor-default opacity-70"
                    : "border-neutral-300 text-neutral-900 hover:border-neutral-600 hover:bg-neutral-50",
                  isBusy && "border-neutral-900 bg-neutral-900 text-white",
                )}
              >
                {o.text}
              </button>
            </li>
          );
        })}
      </ul>

      {state.kind === "error" ? (
        <p role="alert" className="text-center text-sm text-red-600">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
