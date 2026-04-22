# 아키텍처

## 1. 상위 수준 구조

```
┌──────────────────────────────────────────┐
│              사용자 브라우저               │
└───────────────┬──────────────────────────┘
                │ HTTPS
                ↓
┌──────────────────────────────────────────┐
│         Cloudflare (CDN + WAF)           │
│  - CF-IPCountry 헤더 주입                 │
│  - Bot 차단                              │
│  - 정적 자산 캐싱                         │
└───────────────┬──────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────┐
│     Vercel Edge / Serverless Functions   │
│  ┌────────────────────────────────────┐  │
│  │       Next.js 14 (App Router)      │  │
│  │  - Server Components (기본)         │  │
│  │  - Client Components (인터랙션용)    │  │
│  │  - API Routes                       │  │
│  └────────────────────────────────────┘  │
└───────────────┬──────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────┐
│          Supabase (PostgreSQL)           │
│  - questions, options, responses         │
│  - daily_aggregates (성능 집계)           │
│  - RLS로 접근 제어                         │
└──────────────────────────────────────────┘
```

---

## 2. 프론트엔드 아키텍처

### 2.1 렌더링 전략
- **기본은 Server Component** — 데이터 fetch, 초기 렌더링
- **Client Component**는 인터랙션이 필요한 곳만: 버튼 클릭, 지도 hover, 애니메이션
- **Streaming + Suspense**로 지도/차트 같은 무거운 컴포넌트는 점진적 로드

### 2.2 상태 관리
- 서버 상태: `fetch` + Next.js 캐시 + `revalidate`
- 클라이언트 임시 상태: `useState`, `useReducer`
- **전역 상태 라이브러리는 도입하지 않음** (현 Phase). 필요해지면 ADR 작성 후 Zustand 고려.

### 2.3 데이터 fetch 패턴
```ts
// Server Component — 직접 Supabase 호출 가능
async function Page() {
  const today = await getTodayQuestion();
  return <QuestionView question={today} />;
}

// Client Component — API route 호출
function ResponseForm({ questionId }) {
  const submit = async (optionId) => {
    const res = await fetch("/api/responses", {
      method: "POST",
      body: JSON.stringify({ questionId, optionId }),
    });
    // ...
  };
}
```

---

## 3. 백엔드 아키텍처

### 3.1 API Routes 구조
- 모든 엔드포인트는 `src/app/api/*/route.ts`
- 진입부에서 반드시:
  1. Zod로 바디/쿼리 검증
  2. 레이트 리밋 체크 (`lib/ratelimit.ts`)
  3. 세션 해시 추출 (`lib/session`)
- 비즈니스 로직은 `lib/` 하위로 분리, route는 얇게 유지

### 3.2 Server Action 미사용
현 Phase에서는 Server Action을 쓰지 않음. 이유:
- API Route가 더 디버깅하기 쉽고 외부 호출 가능
- 에러 핸들링 관례가 명확
- 캐싱 제어가 더 명시적

변경 필요 시 ADR 작성.

### 3.3 에러 핸들링
- 표준 에러 응답:
  ```json
  {
    "error": {
      "code": "DUPLICATE_RESPONSE",
      "message": "You already answered today's question.",
      "details": { ... }
    }
  }
  ```
- HTTP 상태 코드:
  - 200 성공
  - 400 검증 실패
  - 403 권한 없음 (답 안 하고 결과 조회 등)
  - 409 중복 응답
  - 429 레이트 리밋
  - 500 서버 오류 (로깅 필수)

---

## 4. 데이터 레이어

상세 스키마: [`DATABASE.md`](./DATABASE.md)

### 4.1 Supabase 클라이언트 분리
- `lib/db/client.ts`: 브라우저용 (anon key)
- `lib/db/server.ts`: 서버용 (service role key, API route 내에서만)
- **절대 브라우저로 service role key가 넘어가선 안 됨**

### 4.2 집계 전략 (성능)
현 Phase에서 집계 접근:

**Phase A (MVP, ~1000 응답/일)**
- 매 요청마다 `responses`에서 `GROUP BY` 쿼리
- 결과는 Next.js fetch 캐시로 60초 캐싱

**Phase B (트래픽 증가 시)**
- `daily_aggregates` 테이블 사용
- 응답 INSERT 시 트리거 또는 주기적 집계 잡
- 자세히는 [`DECISIONS.md#ADR-004`](./DECISIONS.md) 참조

### 4.3 Row Level Security (RLS)
- `questions`: anon은 `status='live'` 또는 `'archived'`만 SELECT 가능
- `responses`: anon은 INSERT만 가능, SELECT 불가
- `suggestions`: anon은 INSERT만, SELECT는 관리자
- service role은 모두 가능

---

## 5. 중복 응답 방지 (상세)

### 5.1 방어 계층
```
Layer 1: localStorage
    ↓ (쿠키 삭제 시 무력화)
Layer 2: httpOnly 세션 쿠키 (1년)
    ↓ (인코그니토 모드면 무력화)
Layer 3: 세션 해시 = sha256(IP + UA + DAILY_SALT)
    ↓ (VPN 전환 시 무력화)
Layer 4: DB UNIQUE (question_id, session_hash) 제약
    ← 최후 방어선
```

### 5.2 세션 해시 계산
```ts
// lib/session/hash.ts
function computeSessionHash(ip: string, ua: string): string {
  const salt = getDailySalt(); // SESSION_HASH_SECRET + YYYYMMDD UTC
  return sha256(`${ip}|${ua}|${salt}`);
}
```

**중요**: 솔트가 매일 UTC 00:00에 바뀌므로, 같은 사용자라도 어제와 오늘의 해시가 다름. 이는 의도된 설계 — 개인 추적이 아닌 중복 방지만 목적.

### 5.3 한계와 수용
- VPN 전환, 기기 변경 시 재응답 가능 → **수용**. 완벽한 1인1표 아님.
- 명시적 어뷰즈 (같은 IP에서 1분 내 10번 이상 응답) → 레이트 리밋으로 차단.

---

## 6. 국가 식별

### 6.1 헤더 우선순위
```ts
// 프로덕션
// 1) Cloudflare 앞단 (있을 때)
const cf = request.headers.get("cf-ipcountry");
// 2) Vercel 플랫폼 헤더 (CF 없거나 비활성 시 fallback)
const vercel = request.headers.get("x-vercel-ip-country");

// 로컬 개발
const country = process.env.DEV_COUNTRY_OVERRIDE ?? null;
```

### 6.2 특수 값 처리
- `XX`, `T1`(Tor), `EU`(불명) → `null`로 저장
- `country_code`가 null인 응답은 "Unknown" 버킷으로 집계, 지도엔 표시 안 함

---

## 7. 국제화 (i18n)

### 7.1 라우팅
- `/en/...`, `/ko/...`, `/ja/...`
- 루트 `/`는 `Accept-Language` 헤더로 자동 리다이렉트
- `next-intl` 미들웨어 사용

### 7.2 메시지 파일
- `src/i18n/messages/<locale>.json`
- 키는 점표기 (`question.placeholder`, `cta.share`)
- 번역 누락 시 영어 폴백 + 콘솔 경고 (dev 모드)

### 7.3 질문 번역
- DB `question_translations` 테이블에 locale별 텍스트 저장
- 번역 없는 locale 요청 시: 영어로 반환 + 응답에 `isFallback: true` 플래그
- 관리자 페이지에서 번역 추가/편집

---

## 8. 캐싱 전략

### 8.1 정적 자산
- Cloudflare Cache (이미지, 폰트, JS/CSS 번들) — 1년
- `Cache-Control: public, max-age=31536000, immutable`

### 8.2 API 응답
| 엔드포인트 | 캐시 |
|---|---|
| GET /api/today | 60초 (SWR 300초) |
| POST /api/responses | 캐시 안 함 |
| GET /api/results/:id | 30초 |
| GET /api/archive | 5분 |
| GET /api/og/:id | 1시간 (이미지) |

### 8.3 Next.js 데이터 캐시
- `fetch()`에 `next: { revalidate: 60 }` 옵션
- 수동 무효화는 `revalidateTag("today-question")` 형태로 (질문 변경 시)

---

## 9. 관찰성 (Observability)

### 9.1 에러 추적
- Sentry 무료 티어
- 서버/클라이언트 모두 자동 captureException
- `error.tsx`에서 사용자 친화적 메시지 + Sentry 리포트

### 9.2 분석
- Plausible (페이지 뷰, 전환 이벤트)
- 핵심 이벤트:
  - `question_viewed`
  - `response_submitted` (with option index)
  - `share_clicked` (with platform)
  - `archive_opened`

### 9.3 로그
- 서버 로그: Vercel 자동 수집
- 중요 이벤트 (질문 공개, 집계 갱신, 관리자 액션)는 `console.log` + 구조화 JSON

---

## 10. 보안

### 10.1 입력 검증
- 모든 API route 진입부에서 Zod 검증
- HTML/SQL 인젝션은 Supabase 파라미터화 쿼리로 자동 방어

### 10.2 레이트 리밋
- `lib/ratelimit.ts`: IP 기반
- 기본 1분당 30req, 응답 제출은 1분당 5req
- 초과 시 429 + Retry-After 헤더

### 10.3 CORS
- 기본 same-origin
- Public API (Phase 3) 도입 시 별도 `/api/public/*` 네임스페이스 + CORS 허용

### 10.4 Secrets
- 모든 시크릿은 환경 변수. 코드에 하드코딩 절대 금지.
- `NEXT_PUBLIC_` 프리픽스는 클라이언트 노출 허용 키에만.

---

## 11. 배포 파이프라인

### 11.1 환경
- `development`: 로컬
- `preview`: Vercel Preview (PR별)
- `production`: Vercel 프로덕션

### 11.2 DB 환경
- 로컬: Supabase CLI로 로컬 Postgres 띄움
- Preview/Production: 실제 Supabase 프로젝트 (분리 권장하나, 예산상 통합도 허용)

### 11.3 마이그레이션
- `supabase/migrations/` 순번 SQL
- `npm run db:migrate`으로 적용
- 프로덕션 적용은 수동 확인 후 진행 (사용자 확인 필수)

### 11.4 CI/CD
- GitHub Actions: lint + typecheck + test (PR마다)
- Vercel 자동 배포: main 브랜치 push 시 프로덕션, 그 외 PR은 preview
