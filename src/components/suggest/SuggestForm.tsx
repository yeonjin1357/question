"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Plus, Send, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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

const INPUT_CLASS =
  "w-full rounded-2xl border-2 border-neutral-200 bg-white px-4 py-3 text-base transition-colors focus:border-brand-400 focus:outline-none";

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
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-6 px-5 py-8 sm:px-8"
    >
      <header className="flex flex-col items-start gap-2">
        <span aria-hidden className="text-5xl">
          💡
        </span>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("suggest.title")}
        </h1>
        <p className="text-sm text-neutral-600">{t("suggest.description")}</p>
      </header>

      <AnimatePresence>
        {status.kind === "success" ? (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl bg-accent-green px-4 py-3 text-sm text-neutral-900"
          >
            <CheckCircle2 size={18} className="text-green-700" aria-hidden />
            <span className="font-medium">{t("suggest.success")}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Card variant="elevated" padded>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">
              {t("suggest.questionLabel")}
            </span>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              minLength={10}
              maxLength={200}
              required
              className={INPUT_CLASS}
            />
            <span className="flex justify-between text-xs text-neutral-500">
              <span className="text-red-600">{fieldErrors.questionText ?? ""}</span>
              <span className="tabular-nums">{questionText.trim().length} / 200</span>
            </span>
          </label>

          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium text-neutral-700">
              {t("suggest_form.optionsLegend")}
            </legend>
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
                  className={INPUT_CLASS}
                />
                {canRemoveOption ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(o.id)}
                    aria-label={t("suggest.removeOption")}
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <X size={18} />
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
                className="inline-flex w-fit items-center gap-1.5 rounded-full border-2 border-dashed border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:border-brand-400 hover:text-brand-700"
              >
                <Plus size={14} /> {t("suggest.addOption")}
              </button>
            ) : null}
          </fieldset>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">
              {t("suggest.emailLabel")}
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={INPUT_CLASS}
            />
            {fieldErrors.submitterEmail ? (
              <span className="text-xs text-red-600">{fieldErrors.submitterEmail}</span>
            ) : null}
          </label>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              loading={status.kind === "submitting"}
              leftIcon={<Send size={16} />}
              size="lg"
            >
              {status.kind === "submitting" ? t("suggest.submitting") : t("suggest.submit")}
            </Button>
            {status.kind === "error" ? (
              <p role="alert" className="text-sm text-red-600">
                {status.message}
              </p>
            ) : null}
          </div>
        </form>
      </Card>
    </main>
  );
}
