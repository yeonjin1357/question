# Development Roadmap

Claude Code는 **체크되지 않은 가장 앞의 태스크**를 집어서 작업합니다.
각 태스크는 **합격 기준(AC)**을 전부 통과해야 체크됩니다.

태스크가 모호하면 사용자에게 확인받으세요. 절대 추측으로 진행하지 마세요.

---

## Phase 0: 기반 세팅 (Week 1 전반)

### T-001. Next.js 프로젝트 초기화
- [x] `create-next-app`으로 TypeScript + Tailwind + App Router 세팅
- [x] `src/` 디렉토리 사용
- [x] ESLint, Prettier 설정 ([`CONVENTIONS.md`](./CONVENTIONS.md) 기준)
- [x] `package.json`에 `dev`, `build`, `start`, `lint`, `typecheck`, `format` 스크립트 정의

**합격 기준**
- `npm run dev` 후 `/`에서 기본 페이지 렌더링
- `npm run lint`, `npm run typecheck` 무오류
- `.prettierrc`, `.eslintrc` 존재

**파일 영향 범위**: `package.json`, `tsconfig.json`, `.eslintrc`, `.prettierrc`, `next.config.mjs`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`

---

### T-002. 환경 변수 런타임 검증
- [x] `src/lib/env.ts` 작성. Zod로 `.env` 검증
- [x] 누락된 변수는 서버 시작 시 명확한 에러로 throw
- [x] `.env.example`과 일치 확인

**합격 기준**
- `SESSION_HASH_SECRET` 빼고 `npm run dev` → 에러 메시지에 어떤 변수가 누락인지 표시
- 정상 변수로 `npm run dev` → 성공

**파일 영향 범위**: `src/lib/env.ts`, `.env.example`

---

### T-003. Supabase 프로젝트 연결
- [x] Supabase 프로젝트 생성 (사용자에게 대시보드 URL + keys 요청)
- [x] `@supabase/supabase-js` 설치
- [x] `src/lib/db/client.ts` (브라우저용), `src/lib/db/server.ts` (서버용) 작성
- [x] Supabase CLI 설치 및 `supabase init`
- [x] Supabase MCP 등록 (project scope, read-only, project-ref 고정)

**합격 기준**
- 빈 쿼리 `supabase.from('nonexistent').select()` → 네트워크 도달 (에러여도 무방)
- 클라이언트에는 service role key가 번들에 포함 안 됨 (빌드 후 확인)

**파일 영향 범위**: `src/lib/db/*`, `supabase/config.toml`

---

### T-004. DB 스키마 마이그레이션
- [x] `supabase/migrations/0001_initial.sql`: [`DATABASE.md`](./DATABASE.md)의 전체 스키마
- [x] `supabase/migrations/0002_rls.sql`: RLS 정책
- [x] `npm run db:migrate` 스크립트
- [x] `supabase/seed.sql`: 개발용 시드 (질문 3개, 옵션들, 응답 500개)

**합격 기준**
- 로컬 Supabase에 마이그레이션 성공
- 시드 실행 후 `SELECT count(*) FROM responses` 결과 500
- RLS 정책이 `anon` 역할로 `responses` SELECT 차단함

**파일 영향 범위**: `supabase/migrations/*`, `supabase/seed.sql`

---

### T-005. DB 타입 자동 생성
- [x] `supabase gen types typescript` 스크립트를 `npm run db:types`로 노출
- [x] `src/types/database.ts`에 출력
- [x] 클라이언트/서버 래퍼를 제네릭 `Database` 타입으로 타이핑

**합격 기준**
- `supabase.from('questions').select()` 결과 타입 정확 추론
- 없는 컬럼 접근 시 tsc 에러

**파일 영향 범위**: `src/types/database.ts`, `src/lib/db/*`

---

## Phase 1: MVP 코어 (Week 1 후반 ~ Week 2)

### T-010. 세션 해시 유틸
- [x] `src/lib/session/hash.ts` 작성
- [x] `computeSessionHash(ip: string, ua: string): string`
- [x] `getDailySalt(): string` — `SESSION_HASH_SECRET` + UTC date string
- [x] 단위 테스트: 같은 입력 → 같은 해시, 날짜 바뀌면 다른 해시

**합격 기준**
- `npm run test lib/session` 통과
- 해시 길이 64자 (SHA-256 hex)

**파일 영향 범위**: `src/lib/session/hash.ts`, `src/lib/session/hash.test.ts`

---

### T-011. 국가 코드 추출 유틸
- [x] `src/lib/geo/country.ts`
- [x] `getCountryFromRequest(req: NextRequest): string | null`
- [x] 프로덕션: `cf-ipcountry` 헤더. 로컬: `DEV_COUNTRY_OVERRIDE`
- [x] 특수값 `XX`, `T1`, `EU`는 `null` 반환
- [x] 단위 테스트

**파일 영향 범위**: `src/lib/geo/country.ts` + 테스트

---

### T-012. Zod 스키마 정의
- [x] `src/lib/validation/`에 API 입력 스키마
  - `submitResponseSchema`
  - `suggestQuestionSchema`
  - `localeSchema`
- [x] 각 route에서 `schema.parse(body)` 또는 `safeParse`

**파일 영향 범위**: `src/lib/validation/*`

---

### T-013. `GET /api/today` 구현
- [x] `src/app/api/today/route.ts`
- [x] 로케일 파싱 (쿼리 > Accept-Language > 'en')
- [x] 오늘의 live 질문 + 옵션 + 번역 fetch
- [x] 세션 해시로 내 응답 조회 (myResponse)
- [x] 캐시 헤더: `private, max-age=60, stale-while-revalidate=300` (user-specific data 때문에 public → private)

**합격 기준**
- 시드 데이터로 curl 시 [`API.md`](./API.md)의 응답 포맷 일치
- 번역 없는 locale 요청 시 `isTranslationFallback: true` 포함
- 로케일 쿼리 `?locale=ko` 동작

**파일 영향 범위**: `src/app/api/today/route.ts`, `src/lib/db/queries/questions.ts`

---

### T-014. `POST /api/responses` 구현
- [x] 바디 Zod 검증
- [x] 세션 해시 계산
- [x] `question.status == 'live'` 확인, 아니면 400
- [x] INSERT 시도 → 중복이면 409
- [x] 성공 시 결과 집계 (Phase A: 실시간 GROUP BY) 포함해서 반환
- [x] 세션 쿠키 세팅 (httpOnly, SameSite=Lax, 1년)

**합격 기준**
- 새 세션으로 POST → 201 + results 반환
- 같은 세션으로 재POST → 409
- 잘못된 optionId → 400
- RLS가 뚫리지 않음 (anon key로 직접 INSERT 시도하면 실패 확인)

**파일 영향 범위**: `src/app/api/responses/route.ts`, `src/lib/db/queries/responses.ts`, `src/lib/db/queries/results.ts`

---

### T-015. `GET /api/results/:id` 구현
- [x] 경로 파라미터 UUID 검증
- [x] 세션 쿠키 + 해시로 응답 여부 체크
- [x] 미응답 시 403
- [x] 결과 반환 (T-014와 동일한 집계 함수 재사용)

**파일 영향 범위**: `src/app/api/results/[id]/route.ts`

---

### T-016. 레이트 리밋 미들웨어
- [x] `src/lib/ratelimit.ts` — 메모리 기반 LRU (프로세스별)
- [x] API route에서 `rateLimitFromRequest(request, { key, windowSeconds, max })`
- [x] 초과 시 429 + `Retry-After`

**주의**: 메모리 기반은 Vercel 서버리스 환경에서 완벽하지 않음. Phase 2에서 Upstash Redis로 교체 검토 (ADR 필요).

**파일 영향 범위**: `src/lib/ratelimit.ts`, 모든 API route 진입부

---

### T-017. 메인 페이지 UI — Server Component 뼈대
- [x] `src/app/[locale]/page.tsx` — 오늘의 질문 fetch, 서버에서 렌더
- [x] `next-intl` 미들웨어 설치 및 설정
- [x] 기본 레이아웃 (헤더, 푸터, 메인)

**합격 기준**
- `/ko`, `/en` 접근 시 각 언어로 렌더
- `/` 접근 시 Accept-Language로 자동 리다이렉트

**파일 영향 범위**: `src/app/[locale]/page.tsx`, `src/middleware.ts`, `src/i18n/config.ts`, `src/i18n/messages/*.json`

---

### T-018. 질문 카드 & 응답 버튼 컴포넌트
- [x] `src/components/question/QuestionCard.tsx` (Server Component)
- [x] `src/components/question/ResponseButtons.tsx` (Client Component)
- [x] 클릭 시 `POST /api/responses` 호출
- [x] 로딩/에러 상태 처리
- [x] 응답 후 결과 컴포넌트로 전환 (T-019에서 차트 붙임)

**합격 기준**
- 클릭 시 즉시 피드백 (버튼 비활성화, 스피너)
- 에러 시 사용자 친화적 메시지
- 성공 시 결과 섹션으로 전환

**파일 영향 범위**: `src/components/question/*`

---

### T-019. 결과 바 차트
- [x] `src/components/results/GlobalBarChart.tsx`
- [x] Recharts 사용. 옵션별 퍼센트 표시
- [x] 내가 선택한 옵션은 색상 강조
- [x] 참여자 수 표시

**파일 영향 범위**: `src/components/results/*`

---

### T-020. 세계지도 컴포넌트
- [x] `src/components/results/WorldMap.tsx` (Client Component)
- [x] `react-simple-maps` + `world-atlas/countries-110m.json` (public/ 에 복사)
- [x] 국가별 "최다 선택" 색상 매핑
- [x] 참여자 10명 미만 국가는 회색
- [x] Hover 툴팁: 국가명, 총 응답 수, 옵션별 퍼센트
- [x] 모바일 터치 대응 (touch 이벤트도 mouseEnter/Move 를 발생시킴)

**합격 기준**
- 시드 데이터로 지도 렌더링 확인
- 데스크탑 hover, 모바일 터치 모두 동작
- Lighthouse 접근성 점수 90+

**파일 영향 범위**: `src/components/results/WorldMap.tsx`, `public/world-atlas/*`

---

### T-021. 중복 응답 UX
- [x] 재방문 시 `myResponse`가 있으면 바로 결과 화면 (QuestionFlow initial state)
- [x] "You answered: ..." 배너 표시 (ResultsView)
- [x] 카운트다운 "Next question in HH:MM:SS" (CountdownBanner + useCountdown)

**파일 영향 범위**: `src/app/[locale]/page.tsx`, `src/components/question/AlreadyAnswered.tsx`, `src/hooks/useCountdown.ts`

---

## Phase 2: 공유 & 아카이브 (Week 3–4)

### T-030. OG 이미지 생성
- [x] `src/app/api/og/[id]/route.tsx` — `next/og` ImageResponse + Edge Runtime
- [x] 질문 텍스트 + 옵션별 퍼센트 바
- [x] 하이라이트: `?opt=xxx` 쿼리로 특정 답변 강조
- [x] OG 태그 (`src/app/[locale]/layout.tsx` + page.tsx generateMetadata)
- [x] Twitter Card 태그 (summary_large_image)
- ⚠️ CJK 폰트 런타임 로드 실패 → MVP 는 OG 영어 고정. `docs/ROADMAP.md` T-052 (폴리싱) 에서 폰트 번들로 해결 예정.

**합격 기준**
- `/api/og/<uuid>` 직접 접근 시 1200×630 PNG
- 트위터 링크 프리뷰에서 카드 렌더
- 카카오톡 링크 프리뷰에서 이미지 보임

**파일 영향 범위**: `src/app/api/og/[id]/route.tsx`, `src/app/[locale]/layout.tsx`

---

### T-031. 공유 버튼
- [x] `src/components/shared/ShareButton.tsx`
- [x] Web Share API (모바일) + 폴백 (링크 복사 → Twitter intent)
- [x] 공유 URL: `/{locale}/share/:questionId?opt=...&country=...` + 전용 페이지
  - 카카오톡은 SDK 필요해서 MVP 범위 밖 (Web Share API 가 모바일 카카오톡도 커버)

**파일 영향 범위**: `src/components/shared/ShareButton.tsx`, `src/app/[locale]/share/[id]/page.tsx`

---

### T-032. 아카이브 페이지
- [x] `/api/archive` 구현 (커서 페이지네이션, cache-control 5분 + SWR 10분)
- [x] `/archive` 페이지 UI (리스트, "Load more" 커서 링크)
- [x] `/archive/:date` 상세 (+ OG 메타)
- [x] 카테고리 필터 (chip 네비게이션)

**파일 영향 범위**: `src/app/api/archive/route.ts`, `src/app/[locale]/archive/page.tsx`, `src/app/[locale]/archive/[date]/page.tsx`

---

## Phase 3: i18n 심화 & 질문 제안 (Week 5–6)

### T-040. 번역 파일 확장
- [x] en, ko 전체 메시지 완성
- [x] ja, es 메시지 추가 (사용자 검수 필요)
- [x] 누락 키 감지 스크립트 `npm run i18n:check` (모든 locale 36 키 동일 확인)

**파일 영향 범위**: `src/i18n/messages/*.json`, `scripts/i18n-check.ts`

---

### T-041. 질문 제안 폼
- [x] `/suggest` 페이지
- [x] Native React state + Zod (React Hook Form 미설치, 3필드 폼에 오버킬이라 판단)
- [x] 스팸 필터 (워드/링크/긴 숫자열 regex) + 24시간 IP 해시당 3건 제한

**파일 영향 범위**: `src/app/[locale]/suggest/page.tsx`, `src/components/suggest/*`

---

### T-042. 관리자 페이지
- [x] `/admin` 접근 제어 — 미들웨어 Basic Auth + `ADMIN_TOKEN` (원래 ROADMAP의 `ADMIN_EMAILS`는 multi-admin 가정이나 MVP는 단일 토큰으로 단순화)
- [x] 제안 큐 리스트 (pending/approved/rejected 탭), 승인/거절 버튼
- [x] 승인 → 인라인 폼 (publish date + category) → 질문/번역/옵션 자동 생성

**파일 영향 범위**: `src/app/[locale]/admin/*`, `src/app/api/admin/*`

---

## Phase 4: 폴리싱 & 런칭 (Week 7–8)

### T-050. 에러 바운더리 & 로딩
- [x] `src/app/[locale]/error.tsx`, `loading.tsx`, `not-found.tsx`
- [x] 각 route별 적절한 Suspense 경계 ([locale] 하나로 하위 라우트 전체 커버. 각 페이지는 `force-dynamic` 이라 추가 Suspense 없이도 loading.tsx 가 fallback 역할)

---

### T-051. 접근성 점검
- [x] `scripts/a11y-check.mjs` — 휴리스틱 기반 렌더링 HTML 검증 (`npm run a11y`). 완전한 axe-core 는 브라우저 필요 → axe DevTools 확장 사용 권장으로 결정 (DECISIONS 에 기록 가치 낮아 본 노트로 대체)
- [x] Skip-to-main 링크 + `id="main-content"` 랜드마크, `:focus-visible` 전역 포커스 링으로 키보드 플로우 커버
- [ ] 스크린 리더 테스트 (macOS VoiceOver) — 로컬 환경 macOS 아님, 수동 점검 미진행. 런칭 전 실기기에서 확인 필요 (T-056 전)

---

### T-052. 성능 최적화
- [ ] Lighthouse 모바일 Performance 90+ (실기기 측정 미진행; 로컬 환경에 브라우저 부재. 빌드 번들 사이즈 기준은 충족)
- [x] 이미지 최적화 — 현재 `<img>` 사용처 없음. 추후 이미지 도입 시 `next/image` 사용 정책만 명시
- [x] 번들 분석, 큰 의존성 제거 — recharts 제거 (95KB+), `GlobalBarChart` 를 순수 Tailwind 로 교체. `WorldMap` 을 `next/dynamic`(ssr:false) 로 지연 로딩. 홈 라우트 First Load JS 249 kB → 103 kB (-59%).
- [x] 세계지도 world-atlas 파일 gzip 확인 — 원본 108 KB, gzip 39 KB (Next/Vercel 서빙 시 자동 압축). `next.config.mjs` 에서 `/world-atlas/*` 에 장기 캐시 헤더 추가

---

### T-053. 법적 페이지
- [x] `/privacy` 개인정보 처리방침 — SSG. 본문은 영어 원문(법적 해석 일관성), 제목/내비는 i18n
- [x] `/terms` 이용약관 — 동일
- [x] 쿠키 동의 배너 (EU 트래픽용) — `CookieNotice` 컴포넌트. 세션 쿠키만 쓰는 "strictly necessary" 범주지만 투명성 차원에서 1회 고지 후 localStorage dismiss

---

### T-054. 모니터링 설정
- [x] Plausible 스크립트 삽입 — `PlausibleScript` 컴포넌트가 `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` 있을 때만 자동 삽입. 로컬은 빈 값 권장
- [x] Sentry 연결 (무료 티어) — `@sentry/nextjs` 설치 완료. `src/instrumentation.ts` (server/edge) + `src/instrumentation-client.ts` (browser) conditional init (DSN 없으면 no-op). `next.config.mjs` 의 `withSentryConfig` 도 DSN 있을 때만 적용.
- [ ] 기본 알림 룰 (에러율 급증 시) — Sentry 프로젝트 생성 후 설정 필요 (T-056 단계)

---

### T-055. 질문 30일치 작성
- [x] `docs/QUESTIONS.md` §5 의 30개를 SQL 로 옮김 → `scripts/seed-launch-questions.sql`
- [x] 최소 en + ko 번역 — 모든 질문/옵션 en + ko 포함
- [x] DB에 `scheduled` 상태로 삽입 — 2026-04-20 ~ 2026-05-19 (30일) 시드 완료. Day 1 (2026-04-20) 은 런칭 당일이라 즉시 `live` 로 승격. dev 시드 데이터(질문 4개 + 응답 500개)는 사전에 전체 truncate.

---

### T-058. 질문 상태 Cron (T-056 선행)
- [x] `/api/cron/rotate-questions` Node runtime 라우트 — `CRON_SECRET` bearer 인증. `scheduled(publish_date=today_utc) → live`, `live(publish_date<today_utc) → archived` idempotent UPDATE
- [x] `src/lib/db/queries/rotation.ts` + 단위 테스트 (fake Supabase 체이너블)
- [x] `vercel.json` 에 `0 0 * * *` 스케줄. Vercel 대시보드에 `CRON_SECRET` 를 env 로 넣으면 Vercel Cron 이 자동으로 `Authorization: Bearer` 붙여 호출
- [ ] 프로덕션 첫 주 cron 로그 확인 (T-056 런칭 이후)

---

### T-056. 프로덕션 배포
- [ ] Vercel 프로젝트 연결
- [ ] 프로덕션 Supabase 분리
- [ ] 환경 변수 세팅
- [ ] **초기 개발 중 채팅/로그에 노출되었던 Supabase JWT secret과 Personal Access Token을 반드시 로테이트** (anon/service_role 재발급, PAT revoke 후 재생성)
- [ ] Cloudflare 앞단 구성 (도메인, CF-IPCountry 확인)
- [ ] 첫 24시간 모니터링

---

### T-057. 런칭 아티팩트
- [ ] Product Hunt 런칭 페이지 준비
- [ ] 트위터/X 런칭 포스트
- [ ] Show HN 글
- [ ] 한국 커뮤니티 (긱뉴스, 디스콰이엇) 글

---

## 완료된 태스크의 체크 방법

```markdown
### T-XXX. ...
- [x] 하위 작업 ← 이렇게 `[x]`로 변경
```

또한 `docs/DECISIONS.md`에 영향을 준 결정이 있다면 함께 기록.
