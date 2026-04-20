import { getTranslations } from "next-intl/server";

export default async function LocaleLoading() {
  const t = await getTranslations("error");
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-live="polite"
      className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <div
        className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100"
        aria-hidden
      />
      <p className="text-sm text-neutral-500">{t("loading")}</p>
    </main>
  );
}
