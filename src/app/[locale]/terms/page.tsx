import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  return { title: t("termsTitle") };
}

const LAST_UPDATED = "2026-04-19";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8 pt-16"
    >
      <header className="flex flex-col gap-2">
        <Link href={`/${locale}`} className="text-xs text-neutral-500 hover:text-neutral-800">
          {t("cta.backToHome")}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{t("legal.termsTitle")}</h1>
        <p className="text-xs text-neutral-500">
          {t("legal.lastUpdated", { date: LAST_UPDATED })}
        </p>
      </header>

      <section className="flex flex-col gap-4 text-sm leading-relaxed">
        <p>
          The English text below is the authoritative version; translations are informational.
        </p>

        <h2 className="text-lg font-semibold">Service</h2>
        <p>
          One Question a Day (&ldquo;the Service&rdquo;) publishes one question per day and
          aggregates answers from around the world. The Service is provided &ldquo;as
          is&rdquo;, free of charge, and without any warranty of availability or accuracy.
        </p>

        <h2 className="text-lg font-semibold">Acceptable use</h2>
        <ul className="list-disc pl-5">
          <li>One answer per person per question. Do not attempt to cast multiple votes or interfere with the aggregation.</li>
          <li>Do not submit spam, hate speech, or personal data when suggesting questions.</li>
          <li>Do not attempt to scrape, overload, or reverse-engineer the Service.</li>
        </ul>

        <h2 className="text-lg font-semibold">Suggestions</h2>
        <p>
          By submitting a question suggestion, you grant us a perpetual, royalty-free licence to
          publish, translate, and modify the suggestion. Do not suggest material you don&rsquo;t
          have the right to share.
        </p>

        <h2 className="text-lg font-semibold">Aggregated results</h2>
        <p>
          Aggregated, anonymous results published on the Service are freely available for
          non-commercial reuse with attribution.
        </p>

        <h2 className="text-lg font-semibold">Liability</h2>
        <p>
          To the extent permitted by law, we are not liable for any loss or damage arising from
          the use of the Service.
        </p>

        <h2 className="text-lg font-semibold">Changes</h2>
        <p>
          We may update these terms from time to time. Continued use of the Service after an
          update constitutes acceptance of the revised terms.
        </p>
      </section>
    </main>
  );
}
