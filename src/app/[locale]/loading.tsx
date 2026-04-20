import { getTranslations } from "next-intl/server";

export default async function LocaleLoading() {
  const t = await getTranslations("error");
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-live="polite"
      className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-5 py-16 text-center sm:px-8"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-500"
        aria-hidden
      />
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("loading")}</p>
    </main>
  );
}
