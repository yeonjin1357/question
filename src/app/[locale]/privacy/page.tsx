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
  return { title: t("privacyTitle") };
}

const LAST_UPDATED = "2026-04-19";

export default async function PrivacyPage({
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
        <h1 className="text-3xl font-bold tracking-tight">{t("legal.privacyTitle")}</h1>
        <p className="text-xs text-neutral-500">
          {t("legal.lastUpdated", { date: LAST_UPDATED })}
        </p>
      </header>

      {/* 법적 문서는 영어 원문이 기준. 각 locale 에서 UI 텍스트는 번역되나
          본문은 영어로 통일 — 번역 차이에 따른 법적 해석 불일치 예방. MVP 기준. */}
      <section className="flex flex-col gap-4 text-sm leading-relaxed">
        <p>
          One Question a Day (&ldquo;we&rdquo;, &ldquo;our&rdquo;) collects the minimum data
          needed to run a global daily micro-survey. The English text below is the
          authoritative version; translations of this page are informational.
        </p>

        <h2 className="text-lg font-semibold">What we store</h2>
        <ul className="list-disc pl-5">
          <li>
            Your answer to each daily question, together with a <em>session hash</em> and a
            two-letter country code derived from your network request.
          </li>
          <li>
            The session hash is a SHA-256 hash of your IP address and User-Agent string, salted
            with a value that rotates every UTC day. We never store the raw IP address. The hash
            cannot be reversed to identify you.
          </li>
          <li>
            A first-party cookie that stores a random session identifier. This cookie is strictly
            necessary so that we can show you your previous answer and the daily results.
          </li>
        </ul>

        <h2 className="text-lg font-semibold">What we do not store</h2>
        <ul className="list-disc pl-5">
          <li>No name, email, or account details (unless you voluntarily submit an email when suggesting a question).</li>
          <li>No raw IP addresses, device fingerprints, or tracking identifiers.</li>
          <li>No advertising or third-party analytics cookies.</li>
        </ul>

        <h2 className="text-lg font-semibold">Analytics</h2>
        <p>
          We use Plausible Analytics, a privacy-friendly analytics service that does not use
          cookies and does not collect any personal data.
        </p>

        <h2 className="text-lg font-semibold">Retention</h2>
        <p>
          Individual responses are retained for as long as the question is available on the
          archive. Aggregated, anonymous statistics are retained indefinitely.
        </p>

        <h2 className="text-lg font-semibold">Your rights (EU / EEA / UK)</h2>
        <p>
          Because we don&rsquo;t store any personal identifiers, we cannot associate responses
          with a specific individual. If you believe data relating to you has been stored, you
          can contact us below and we will make best efforts to locate and remove it.
        </p>

        <h2 className="text-lg font-semibold">Contact</h2>
        <p>
          Questions about this policy: please open an issue on the project&rsquo;s public
          feedback channel, or use the question suggestion form.
        </p>
      </section>
    </main>
  );
}
