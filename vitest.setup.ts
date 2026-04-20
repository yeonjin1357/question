// 테스트 환경용 기본 env 값. 실제 .env.local 이 로드된 경우엔 그 값을 우선.
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.NEXT_PUBLIC_APP_URL ??= "http://localhost:3000";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-role-key";
process.env.SESSION_HASH_SECRET ??= "test-session-hash-secret-at-least-32-chars-long";

// 테스트는 DEV_COUNTRY_OVERRIDE 비활성화 상태에서 실행 — 쉘 env 로 인한 비결정성 제거.
delete process.env.DEV_COUNTRY_OVERRIDE;
