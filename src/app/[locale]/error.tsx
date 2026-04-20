"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

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
      className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 p-8 text-center"
    >
      <h1 className="text-3xl font-bold tracking-tight">{t("pageTitle")}</h1>
      <p className="text-base text-neutral-600 dark:text-neutral-400">{t("pageBody")}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
      >
        {t("retry")}
      </button>
    </main>
  );
}
