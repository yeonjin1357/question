"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { AdminSuggestion } from "@/lib/db/queries/admin";
import { cn } from "@/lib/utils/cn";

interface AdminSuggestionListProps {
  items: AdminSuggestion[];
  /** 현재는 프로퍼티로만 받고 내부 표시에 사용하지 않음. 추후 locale-aware 액션 시 사용. */
  locale?: string;
}

type RowState =
  | { kind: "idle" }
  | { kind: "expanded" }
  | { kind: "busy" }
  | { kind: "done"; message: string }
  | { kind: "error"; message: string };

function nextPublishDate(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function AdminSuggestionList({ items }: AdminSuggestionListProps) {
  const router = useRouter();
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [publishDates, setPublishDates] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Record<string, string>>({});

  function updateRow(id: string, next: RowState) {
    setRowStates((prev) => ({ ...prev, [id]: next }));
  }

  async function approve(item: AdminSuggestion) {
    updateRow(item.id, { kind: "busy" });
    const publishDate = publishDates[item.id] ?? nextPublishDate(7);
    const category = categories[item.id] ?? "habits";
    const res = await fetch(`/api/admin/suggestions/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "approve", publishDate, category }),
    });
    if (res.ok) {
      updateRow(item.id, { kind: "done", message: "Approved" });
      router.refresh();
      return;
    }
    const body = (await res.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    updateRow(item.id, { kind: "error", message: body?.error?.message ?? "Failed" });
  }

  async function reject(item: AdminSuggestion, note: string | null) {
    updateRow(item.id, { kind: "busy" });
    const res = await fetch(`/api/admin/suggestions/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reject", adminNote: note ?? undefined }),
    });
    if (res.ok) {
      updateRow(item.id, { kind: "done", message: "Rejected" });
      router.refresh();
      return;
    }
    updateRow(item.id, { kind: "error", message: "Failed" });
  }

  if (items.length === 0) {
    return <p className="text-sm text-neutral-500">Empty.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-neutral-200">
      {items.map((item) => {
        const state = rowStates[item.id] ?? { kind: "idle" };
        // 승인 폼은 기본적으로 "expanded" 상태 + 제출 중("busy") 에도 열려 있어야 함.
        const expanded = state.kind === "expanded" || state.kind === "busy";
        const busy = state.kind === "busy";
        return (
          <li key={item.id} className="flex flex-col gap-3 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-xs text-neutral-500">
                  <time>{new Date(item.createdAt).toISOString().slice(0, 16)}</time>
                  <span>·</span>
                  <span>{item.locale}</span>
                  {item.submitterEmail ? (
                    <>
                      <span>·</span>
                      <span className="font-mono">{item.submitterEmail}</span>
                    </>
                  ) : null}
                </span>
                <p className="text-base font-medium">{item.questionText}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {item.options.map((o, i) => (
                    <li
                      key={i}
                      className="rounded border border-neutral-300 px-2 py-0.5 text-xs"
                    >
                      {o.text}
                    </li>
                  ))}
                </ul>
                {item.adminNote ? (
                  <p className="text-xs italic text-neutral-500">note: {item.adminNote}</p>
                ) : null}
              </div>

              {item.status === "pending" ? (
                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateRow(
                        item.id,
                        state.kind === "expanded" ? { kind: "idle" } : { kind: "expanded" },
                      )
                    }
                    className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700"
                  >
                    {expanded ? "Cancel" : "Approve…"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const note = window.prompt("Reject note (optional):") ?? null;
                      void reject(item, note);
                    }}
                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    item.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800",
                  )}
                >
                  {item.status}
                </span>
              )}
            </div>

            {expanded ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void approve(item);
                }}
                className="flex flex-wrap items-end gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3"
              >
                <label className="flex flex-col gap-1 text-xs">
                  Publish date
                  <input
                    type="date"
                    required
                    value={publishDates[item.id] ?? nextPublishDate(7)}
                    onChange={(e) =>
                      setPublishDates((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    className="rounded border border-neutral-300 px-2 py-1 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  Category
                  <select
                    value={categories[item.id] ?? "habits"}
                    onChange={(e) =>
                      setCategories((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    className="rounded border border-neutral-300 px-2 py-1 text-sm"
                  >
                    {[
                      "habits",
                      "food",
                      "culture",
                      "values",
                      "tech",
                      "home",
                      "travel",
                      "work",
                      "social",
                      "fun",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
                >
                  {busy ? "Submitting…" : "Create question"}
                </button>
              </form>
            ) : null}

            {state.kind === "error" ? (
              <p role="alert" className="text-xs text-red-600">
                {state.message}
              </p>
            ) : null}
            {state.kind === "done" ? (
              <p className="text-xs text-green-700">✓ {state.message}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
