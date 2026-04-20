"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { suggestQuestionSchema } from "@/lib/validation/suggestion";

type OptionRow = { id: number; text: string };
const MAX_OPTIONS = 4;
const MIN_OPTIONS = 2;

interface SuggestFormProps {
  locale: string;
}

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; id: string }
  | { kind: "error"; message: string };

export function SuggestForm({ locale }: SuggestFormProps) {
  const t = useTranslations();
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<OptionRow[]>([
    { id: 1, text: "" },
    { id: 2, text: "" },
  ]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const canAddOption = options.length < MAX_OPTIONS;
  const canRemoveOption = options.length > MIN_OPTIONS;

  const payload = useMemo(
    () => ({
      questionText: questionText.trim(),
      options: options.map((o) => ({ text: o.text.trim() })),
      locale,
      submitterEmail: email.trim() || undefined,
    }),
    [questionText, options, email, locale],
  );

  const handleAddOption = useCallback(() => {
    setOptions((prev) =>
      prev.length < MAX_OPTIONS ? [...prev, { id: Date.now(), text: "" }] : prev,
    );
  }, []);

  const handleRemoveOption = useCallback((id: number) => {
    setOptions((prev) => (prev.length > MIN_OPTIONS ? prev.filter((o) => o.id !== id) : prev));
  }, []);

  const handleOptionChange = useCallback((id: number, text: string) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, text } : o)));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    // 클라이언트 검증 — 서버 재검증 전 즉각 피드백
    const parsed = suggestQuestionSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.status === 201) {
        const body = (await res.json()) as { data: { id: string } };
        setStatus({ kind: "success", id: body.data.id });
        setQuestionText("");
        setOptions([
          { id: Date.now(), text: "" },
          { id: Date.now() + 1, text: "" },
        ]);
        setEmail("");
        return;
      }
      if (res.status === 400) {
        const body = (await res.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        if (body?.error?.message?.includes("spam")) {
          setStatus({ kind: "error", message: t("suggest.errorSpam") });
        } else {
          setStatus({ kind: "error", message: t("error.generic") });
        }
        return;
      }
      setStatus({ kind: "error", message: t("error.generic") });
    } catch {
      setStatus({ kind: "error", message: t("error.generic") });
    }
  }

  return (
    <main id="main-content" className="mx-auto flex min-h-screen max-w-xl flex-col items-stretch gap-6 p-8 pt-16">
      <header className="flex flex-col gap-2">
        <Link href={`/${locale}`} className="text-xs text-neutral-500 hover:text-neutral-800">
          {t("cta.backToHome")}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{t("suggest.title")}</h1>
        <p className="text-sm text-neutral-600">{t("suggest.description")}</p>
      </header>

      {status.kind === "success" ? (
        <div
          role="status"
          className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900"
        >
          {t("suggest.success")}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t("suggest.questionLabel")}</span>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            rows={3}
            minLength={10}
            maxLength={200}
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-base focus:border-neutral-600 focus:outline-none"
          />
          <span className="flex justify-between text-xs text-neutral-500">
            <span>{fieldErrors.questionText ?? ""}</span>
            <span>{questionText.trim().length} / 200</span>
          </span>
        </label>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium">{t("suggest_form.optionsLegend")}</legend>
          {options.map((o, i) => (
            <div key={o.id} className="flex gap-2">
              <input
                type="text"
                value={o.text}
                onChange={(e) => handleOptionChange(o.id, e.target.value)}
                minLength={1}
                maxLength={50}
                placeholder={t("suggest.optionLabel", { n: i + 1 })}
                required
                className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-600 focus:outline-none"
              />
              {canRemoveOption ? (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(o.id)}
                  className="rounded-md border border-neutral-300 px-3 py-2 text-xs hover:bg-neutral-50"
                >
                  {t("suggest.removeOption")}
                </button>
              ) : null}
            </div>
          ))}
          {fieldErrors.options ? (
            <p className="text-xs text-red-600">{fieldErrors.options}</p>
          ) : null}
          {canAddOption ? (
            <button
              type="button"
              onClick={handleAddOption}
              className="self-start rounded-md border border-dashed border-neutral-400 px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50"
            >
              {t("suggest.addOption")}
            </button>
          ) : null}
        </fieldset>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t("suggest.emailLabel")}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-600 focus:outline-none"
          />
          {fieldErrors.submitterEmail ? (
            <span className="text-xs text-red-600">{fieldErrors.submitterEmail}</span>
          ) : null}
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status.kind === "submitting"}
            className={cn(
              "rounded-md bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition",
              status.kind === "submitting"
                ? "cursor-default opacity-70"
                : "hover:bg-neutral-700",
            )}
          >
            {status.kind === "submitting" ? t("suggest.submitting") : t("suggest.submit")}
          </button>
          {status.kind === "error" ? (
            <p role="alert" className="text-sm text-red-600">
              {status.message}
            </p>
          ) : null}
        </div>
      </form>
    </main>
  );
}
