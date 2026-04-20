import { setRequestLocale } from "next-intl/server";

import { SuggestForm } from "@/components/suggest/SuggestForm";

export const dynamic = "force-dynamic";

export default async function SuggestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SuggestForm locale={locale} />;
}
