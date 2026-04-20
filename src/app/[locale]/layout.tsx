import "../globals.css";
import "@/lib/env";

import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CookieNotice } from "@/components/shared/CookieNotice";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { PlausibleScript } from "@/components/shared/PlausibleScript";
import { ThemeScript } from "@/components/shared/ThemeScript";
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
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
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
  applicationName: "OneQ",
  appleWebApp: {
    capable: true,
    title: "OneQ",
    statusBarStyle: "default",
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f97316" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
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
        <ThemeScript />
        <PlausibleScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} bg-gradient-to-b from-brand-50 via-white to-white text-neutral-900 antialiased dark:from-neutral-950 dark:via-neutral-950 dark:to-black dark:text-neutral-100`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          {t("a11y.skipToMain")}
        </a>
        <NextIntlClientProvider>
          <Header locale={locale} />
          {children}
          <Footer locale={locale} />
          <CookieNotice />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
