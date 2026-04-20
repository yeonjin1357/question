import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (!process.env.SENTRY_DSN) return;

  const common = {
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  };

  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init(common);
  } else if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init(common);
  }
}

export const onRequestError = Sentry.captureRequestError;
