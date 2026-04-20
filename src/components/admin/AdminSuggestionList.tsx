"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import type { AdminSuggestion } from "@/lib/db/queries/admin";
import { cn } from "@/lib/utils/cn";

interface AdminSuggestionListProps {
  items: AdminSuggestion[];
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

const INPUT =
  "rounded-xl border-2 border-neutral-200 bg-white px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none";

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
    return (
      <Card variant="flat" padded className="text-center text-sm text-neutral-500">
        Empty.
      </Card>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => {
        const state = rowStates[item.id] ?? { kind: "idle" };
        const expanded = state.kind === "expanded" || state.kind === "busy";
        const busy = state.kind === "busy";
        return (
          <li key={item.id}>
            <Card variant="elevated" padded>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <time>{new Date(item.createdAt).toISOString().slice(0, 16)}</time>
                      <Chip tone="accent">{item.locale}</Chip>
                      {item.submitterEmail ? (
                        <span className="font-mono text-[11px]">{item.submitterEmail}</span>
                      ) : null}
                    </div>
                    <p className="font-display text-base font-medium">{item.questionText}</p>
                    <ul className="flex flex-wrap gap-1.5">
                      {item.options.map((o, i) => (
                        <li
                          key={i}
                          className="rounded-full bg-neutral-50 px-2.5 py-1 text-xs text-neutral-700"
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
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          updateRow(
                            item.id,
                            state.kind === "expanded" ? { kind: "idle" } : { kind: "expanded" },
                          )
                        }
                      >
                        {expanded ? "Cancel" : "Approve…"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const note = window.prompt("Reject note (optional):") ?? null;
                          void reject(item, note);
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        item.status === "approved"
                          ? "bg-accent-green text-green-900"
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
                    className="flex flex-wrap items-end gap-3 rounded-2xl bg-brand-50 p-4"
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
                        className={INPUT}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs">
                      Category
                      <select
                        value={categories[item.id] ?? "habits"}
                        onChange={(e) =>
                          setCategories((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        className={INPUT}
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
                    <Button type="submit" loading={busy} size="sm">
                      {busy ? "Submitting…" : "Create question"}
                    </Button>
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
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
