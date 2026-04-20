import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * 서버 전용 Supabase 클라이언트. service role 키를 사용해 RLS를 우회하므로
 * **반드시 API route / Server Component / Route Handler 안에서만** 호출하세요.
 *
 * 각 요청마다 새 클라이언트를 만들어 세션을 들고 다니지 않게 합니다.
 *
 * @see docs/ARCHITECTURE.md §4.1
 */
export function createServerSupabase(): SupabaseClient<Database> {
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      // Next.js 가 기본적으로 fetch 응답을 캐시하기 때문에, 라이브 DB 조회 결과가
      // 오래된 캐시로 반환되는 것을 막습니다. 모든 DB 요청을 항상 원본으로.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
