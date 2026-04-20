import { createClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/public-env";
import type { Database } from "@/types/database";

/**
 * 브라우저에서 사용하는 Supabase 클라이언트.
 *
 * anon key만 포함하므로 RLS 정책이 열어준 범위 안에서만 동작합니다.
 * service role이 필요한 작업은 server 래퍼를 API route에서 호출하세요.
 *
 * @see docs/ARCHITECTURE.md §4.1
 */
export const supabaseBrowser = createClient<Database>(
  publicEnv.NEXT_PUBLIC_SUPABASE_URL,
  publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
