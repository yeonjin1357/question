import "server-only";

import { z } from "zod";

/**
 * 서버 전용 환경 변수. `NEXT_PUBLIC_*`까지 포함한 전체 집합을 검증합니다.
 * 누락/형식 오류가 있으면 module import 시점에 throw하여
 * 서버가 잘못된 상태로 기동되지 않도록 막습니다.
 *
 * 클라이언트 번들에 섞여 들어가지 않도록 상단에 `import "server-only"` 가 있습니다.
 */

const schema = z.object({
  // Public (클라이언트 노출 허용)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  // Server-only
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  SESSION_HASH_SECRET: z
    .string()
    .min(32, "SESSION_HASH_SECRET must be at least 32 characters long"),

  // Optional server-only
  DEV_COUNTRY_OVERRIDE: z
    .string()
    .regex(/^[A-Z]{2}$/, "Must be ISO 3166-1 alpha-2 (e.g. KR, US)")
    .optional(),
  RESEND_API_KEY: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),

  /**
   * Sentry DSN — 존재하면 서버/엣지에서 발생한 에러를 Sentry 로 전송.
   * 비우면 monitoring/capture 가 콘솔 로깅으로 동작.
   * @sentry/nextjs 설치 이전까진 placeholder 로 두고 user 확인 후 도입.
   */
  SENTRY_DSN: z.string().url().optional(),

  /**
   * Vercel Cron 에서 `authorization: Bearer <CRON_SECRET>` 헤더로 호출.
   * Vercel 대시보드에서 env 를 추가하면 Cron 이 자동으로 헤더를 붙입니다.
   * 미설정이면 cron 라우트가 503 (cron 미구성) 으로 응답.
   */
  CRON_SECRET: z.string().min(16).optional(),
  /**
   * Basic Auth 비밀번호. 없으면 `/admin` 과 `/api/admin/*` 는 비활성화 (503).
   * 16자 이상 권장 (무작위 문자열).
   */
  ADMIN_TOKEN: z.string().min(16).optional(),

  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type ServerEnv = z.infer<typeof schema>;

function parseEnv(): ServerEnv {
  const parsed = schema.safeParse(process.env);
  if (parsed.success) return parsed.data;

  const lines = parsed.error.issues.map((issue) => {
    const key = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    return `  • ${key}: ${issue.message}`;
  });

  const message = [
    "❌ Invalid environment variables:",
    ...lines,
    "",
    "Copy env.example to .env.local and fill in the missing values.",
  ].join("\n");

  throw new Error(message);
}

export const env: ServerEnv = parseEnv();
