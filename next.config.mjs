import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // 정적 public/ 에셋은 장기 캐시. 빌드마다 파일명이 바뀌지 않는 파일이므로 stale-while-revalidate 수준의 캐시.
  async headers() {
    return [
      {
        source: "/world-atlas/:path*",
        headers: [
          { key: "cache-control", value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

const withSentry = (config) =>
  process.env.SENTRY_DSN
    ? withSentryConfig(config, {
        silent: true,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        hideSourceMaps: true,
        disableLogger: true,
      })
    : config;

export default withSentry(withNextIntl(nextConfig));
