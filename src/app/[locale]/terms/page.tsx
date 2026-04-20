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
      className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-5 py-8 sm:px-8"
    >
      <Link
        href={`/${locale}`}
        className="inline-flex w-fit items-center gap-1 text-xs text-neutral-500 hover:text-brand-600"
      >
        {t("cta.backToHome")}
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("legal.termsTitle")}
        </h1>
        <p className="text-xs text-neutral-500">
          {t("legal.lastUpdated", { date: LAST_UPDATED })}
        </p>
      </header>

      <section className="flex flex-col gap-4 text-sm leading-relaxed text-neutral-800">
        <p>
          The English text below is the authoritative version; translations are informational.
        </p>

        <h2 className="font-display text-lg font-semibold mt-2">Service</h2>
        <p>
          One Question a Day (&ldquo;the Service&rdquo;) publishes one question per day and
          aggregates answers from around the world. The Service is provided &ldquo;as
          is&rdquo;, free of charge, and without any warranty of availability or accuracy.
        </p>

        <h2 className="font-display text-lg font-semibold mt-2">Acceptable use</h2>
        <ul className="list-disc pl-5">
          <li>One answer per person per question. Do not attempt to cast multiple votes or interfere with the aggregation.</li>
          <li>Do not submit spam, hate speech, or personal data when suggesting questions.</li>
          <li>Do not attempt to scrape, overload, or reverse-engineer the Service.</li>
        </ul>

        <h2 className="font-display text-lg font-semibold mt-2">Suggestions</h2>
        <p>
          By submitting a question suggestion, you grant us a perpetual, royalty-free licence to
          publish, translate, and modify the suggestion. Do not suggest material you don&rsquo;t
          have the right to share.
        </p>

        <h2 className="font-display text-lg font-semibold mt-2">Aggregated results</h2>
        <p>
          Aggregated, anonymous results published on the Service are freely available for
          non-commercial reuse with attribution.
        </p>

        <h2 className="font-display text-lg font-semibold mt-2">Liability</h2>
        <p>
          To the extent permitted by law, we are not liable for any loss or damage arising from
          the use of the Service.
        </p>

        <h2 className="font-display text-lg font-semibold mt-2">Changes</h2>
        <p>
          We may update these terms from time to time. Continued use of the Service after an
          update constitutes acceptance of the revised terms.
        </p>
      </section>
    </main>
  );
}
