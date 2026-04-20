import "server-only";

import * as Sentry from "@sentry/nextjs";

import { env } from "@/lib/env";

type Tags = Record<string, string | number | boolean>;

export function captureException(err: unknown, context?: { tags?: Tags; extra?: unknown }): void {
  if (env.SENTRY_DSN) {
    Sentry.captureException(err, { tags: context?.tags, extra: { extra: context?.extra } });
    return;
  }
  // eslint-disable-next-line no-console
  console.error("[monitor] exception", {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    tags: context?.tags,
    extra: context?.extra,
  });
}

export function captureMessage(message: string, context?: { tags?: Tags }): void {
  if (env.SENTRY_DSN) {
    Sentry.captureMessage(message, { tags: context?.tags });
    return;
  }
  // eslint-disable-next-line no-console
  console.warn("[monitor] message", { message, tags: context?.tags });
}
