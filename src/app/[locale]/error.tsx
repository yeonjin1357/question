"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { Button } from "@/components/ui/Button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error("[locale error boundary]", error);
  }, [error]);

  return (
    <main
      id="main-content"
      role="alert"
      className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-5 px-5 py-16 text-center sm:px-8"
    >
      <span aria-hidden className="text-6xl">
        🤷
      </span>
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {t("pageTitle")}
      </h1>
      <p className="max-w-md text-base text-neutral-600 dark:text-neutral-400">{t("pageBody")}</p>
      <Button onClick={reset} variant="primary" size="lg">
        {t("retry")}
      </Button>
    </main>
  );
}
