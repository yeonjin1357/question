import { z } from "zod";

/**
 * 클라이언트와 서버 양쪽에서 안전하게 쓰는 공개 환경 변수.
 * `NEXT_PUBLIC_*` 은 Next.js가 빌드 타임에 문자열 리터럴로 인라인하므로,
 * 반드시 `process.env.NEXT_PUBLIC_FOO` 형태로 정적 접근해야 합니다.
 */

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
});

export type PublicEnv = z.infer<typeof schema>;

const raw = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
};

function parsePublicEnv(): PublicEnv {
  const parsed = schema.safeParse(raw);
  if (parsed.success) return parsed.data;

  const lines = parsed.error.issues.map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`);
  throw new Error(["❌ Invalid public environment variables:", ...lines].join("\n"));
}

export const publicEnv: PublicEnv = parsePublicEnv();
