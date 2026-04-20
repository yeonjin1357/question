import "../globals.css";
import "@/lib/env";

import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CookieNotice } from "@/components/shared/CookieNotice";
import { PlausibleScript } from "@/components/shared/PlausibleScript";
import { routing } from "@/i18n/routing";
import { env } from "@/lib/env";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const DEFAULT_DESCRIPTION =
  "One question, one day, the whole world answers. A global micro-survey visualised on a world map.";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "One Question a Day",
    template: "%s | One Question a Day",
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: "One Question a Day",
    description: DEFAULT_DESCRIPTION,
    siteName: "One Question a Day",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "One Question a Day",
    description: DEFAULT_DESCRIPTION,
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <html lang={locale}>
      <head>
        <PlausibleScript />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-neutral-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          {t("a11y.skipToMain")}
        </a>
        <NextIntlClientProvider>
          {children}
          <footer className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-4 px-8 pb-8 text-xs text-neutral-500">
            <Link href={`/${locale}/privacy`} className="hover:text-neutral-800">
              {t("legal.privacy")}
            </Link>
            <span aria-hidden>·</span>
            <Link href={`/${locale}/terms`} className="hover:text-neutral-800">
              {t("legal.terms")}
            </Link>
            <span aria-hidden>·</span>
            <Link href={`/${locale}/archive`} className="hover:text-neutral-800">
              {t("archive.title")}
            </Link>
            <span aria-hidden>·</span>
            <Link href={`/${locale}/suggest`} className="hover:text-neutral-800">
              {t("suggest.title")}
            </Link>
          </footer>
          <CookieNotice />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
