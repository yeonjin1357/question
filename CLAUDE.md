# CLAUDE.md

이 문서는 Claude Code가 이 저장소에서 작업할 때 읽는 **최상위 지침서**입니다. 모든 작업 시작 전에 이 문서와 이 문서가 참조하는 docs/를 확인하세요.

---

## 프로젝트 한 줄 소개

**One Question a Day**: 매일 UTC 00:00에 공개되는 단 하나의 질문. 전 세계 사용자의 답을 국가별로 시각화하는 글로벌 마이크로 설문 웹앱.

- 상세 제품 스펙: [`docs/PRD.md`](./docs/PRD.md)
- 아키텍처/스택: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- 개발 작업 목록: [`docs/ROADMAP.md`](./docs/ROADMAP.md)
- 주요 결정사항(ADR): [`docs/DECISIONS.md`](./docs/DECISIONS.md)

---

## 작업 시작 전 체크리스트

Claude Code는 **새 작업을 시작할 때마다** 다음을 확인합니다:

1. [`docs/ROADMAP.md`](./docs/ROADMAP.md)에서 현재 작업 중인 Phase와 체크되지 않은 가장 앞의 태스크 확인
2. 해당 태스크의 "파일 영향 범위" 확인
3. 관련 있는 ADR([`docs/DECISIONS.md`](./docs/DECISIONS.md))이 있는지 확인
4. 컨벤션([`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md)) 재확인
5. 작업 완료 후 합격 기준(Acceptance Criteria) 전부 통과 확인 → ROADMAP에 체크

---

## Quick Commands

```bash
# 개발
npm run dev              # 로컬 개발 서버 (http://localhost:3000)
npm run build            # 프로덕션 빌드
npm run start            # 프로덕션 서버 로컬 실행

# 품질
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit
npm run format           # Prettier 적용
npm run test             # Vitest 단위 테스트
npm run test:e2e         # Playwright E2E (선택)

# DB (Supabase)
npm run db:migrate       # 로컬 마이그레이션 적용
npm run db:reset         # 로컬 DB 리셋 + 시드
npm run db:types         # DB 스키마로부터 TypeScript 타입 생성
npm run db:seed          # 시드 데이터 주입

# 배포
npm run deploy           # Vercel 프로덕션 배포
```

### "완료" 선언 전 반드시 통과시켜야 하는 것

```bash
npm run typecheck && npm run lint && npm run test
```

이 세 커맨드 중 하나라도 실패하면 작업은 **완료되지 않은 것**입니다. 수정 후 다시 실행하세요.

---

## 기술 스택 (고정, 변경 금지)

| 레이어 | 선택 |
|---|---|
| 런타임/언어 | Node.js 20+, TypeScript 5+ (strict) |
| 프레임워크 | Next.js 14 (App Router) |
| 스타일 | Tailwind CSS |
| DB | Supabase (PostgreSQL) |
| 호스팅 | Vercel |
| CDN/프록시 | Cloudflare (앞단) |
| 지도 | `react-simple-maps` + `world-atlas` |
| 차트 | Recharts |
| i18n | `next-intl` |
| 테스트 | Vitest (단위), Playwright (E2E) |
| 폼 검증 | Zod |
| 분석 | Plausible |

스택 변경이 필요하다고 판단되면 **절대 임의로 변경하지 말고** 사용자에게 먼저 확인받으세요. ADR을 새로 작성하여 근거를 남깁니다.

---

## 디렉토리 구조

```
.
├── CLAUDE.md                    # 이 파일
├── README.md
├── .env.example                 # 환경 변수 템플릿
├── .env.local                   # 로컬 환경 변수 (git ignore)
├── next.config.mjs
├── tsconfig.json
├── tailwind.config.ts
├── package.json
│
├── docs/                        # 프로젝트 문서 (Claude Code 필수 참고)
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── ROADMAP.md
│   ├── CONVENTIONS.md
│   ├── DECISIONS.md
│   └── QUESTIONS.md
│
├── supabase/
│   ├── migrations/              # SQL 마이그레이션 (순번 prefix)
│   └── seed.sql
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── [locale]/            # i18n 라우팅
│   │   │   ├── page.tsx         # 오늘의 질문 (메인)
│   │   │   ├── archive/
│   │   │   ├── suggest/
│   │   │   └── about/
│   │   ├── api/                 # API Routes
│   │   │   ├── today/route.ts
│   │   │   ├── responses/route.ts
│   │   │   ├── results/[id]/route.ts
│   │   │   ├── archive/route.ts
│   │   │   ├── suggestions/route.ts
│   │   │   └── og/[id]/route.tsx
│   │   └── layout.tsx
│   │
│   ├── components/              # React 컴포넌트
│   │   ├── ui/                  # 범용 (Button, Card, ...)
│   │   ├── question/            # 질문 관련
│   │   ├── results/             # 결과/지도 관련
│   │   └── shared/
│   │
│   ├── lib/                     # 비즈니스 로직
│   │   ├── db/                  # Supabase 클라이언트 + 쿼리
│   │   ├── session/             # 세션 해시, 중복 방지
│   │   ├── geo/                 # 지오로케이션 (CF-IPCountry)
│   │   ├── validation/          # Zod 스키마
│   │   └── utils/
│   │
│   ├── hooks/                   # React 훅
│   ├── types/                   # 전역 타입 (DB 생성 타입 포함)
│   ├── i18n/                    # next-intl 설정 + 메시지
│   │   ├── config.ts
│   │   └── messages/
│   │       ├── en.json
│   │       ├── ko.json
│   │       └── ...
│   └── styles/
│
├── public/
└── tests/
    ├── unit/
    └── e2e/
```

### 새 파일 생성 규칙

- **컴포넌트**: `src/components/<category>/<ComponentName>.tsx` — PascalCase
- **유틸리티/hook/lib**: `src/lib/<domain>/<name>.ts` — kebab-case 파일명, camelCase export
- **API route**: `src/app/api/<resource>/route.ts`
- **타입**: 지역 타입은 같은 파일, 전역 공유 타입만 `src/types/`
- **테스트**: 테스트 대상과 같은 디렉토리에 `<name>.test.ts` 또는 `tests/` 하위

---

## 핵심 컨벤션 (요약)

전체 컨벤션: [`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md)

### 절대 규칙
1. **TypeScript strict 모드 유지**. `any`, `@ts-ignore` 금지. 불가피할 경우 `unknown` + 타입 가드 사용.
2. **클라이언트에서 Supabase service role key 사용 금지**. anon key만 클라이언트에서 사용, service role은 서버 route에서만.
3. **응답(Response) 저장 시 raw IP를 DB에 저장 금지**. 해시(SHA-256 + daily salt)만 저장.
4. **모든 사용자 입력은 Zod로 검증**. API route 진입부에서 반드시.
5. **하드코딩된 문자열 금지** (UI 표시용). 반드시 `next-intl` messages를 통해서.
6. **시간은 UTC 기반으로 저장 및 쿼리**. 사용자 표시 시에만 로컬로 변환.
7. **Server Component를 기본으로**. `"use client"`는 필요할 때만 명시.

### 네이밍
- 컴포넌트: `PascalCase` (`QuestionCard.tsx`)
- 훅: `useCamelCase` (`useCountdown.ts`)
- 유틸: `camelCase` (`hashSession.ts`)
- 상수: `SCREAMING_SNAKE_CASE`
- DB 테이블/컬럼: `snake_case` (SQL), TS에서는 자동 생성 타입 사용

### Import 순서
```ts
// 1. Node built-ins
// 2. 외부 패키지
// 3. 내부 절대경로 (@/lib, @/components)
// 4. 상대경로
// 5. 타입만 import는 `import type`
```

---

## 사용자와 Claude Code의 협업 규칙

### Claude Code가 **자율적으로 진행**해도 되는 것
- ROADMAP의 체크되지 않은 태스크를 순서대로 구현
- 합격 기준(AC) 통과를 위한 코드 작성, 리팩터링, 테스트 추가
- `typecheck`, `lint`, `test` 실패 해결
- 버그 수정 및 관련 테스트 추가
- 기존 컨벤션을 따르는 새 컴포넌트/유틸 생성

### Claude Code가 **반드시 사용자에게 확인**받아야 하는 것
- 기술 스택 변경 (패키지 추가 제외)
- 데이터 모델(스키마) 변경
- ADR 수준의 설계 결정 (캐싱 전략, 인증 도입 등)
- 외부 유료 서비스 도입
- 보안/프라이버시 관련 변경
- 프로덕션 배포
- 파괴적 변경 (`db:reset`, 대량 파일 삭제, 디렉토리 구조 개편)

### 패키지 추가 규칙
- 소형 유틸 (clsx, date-fns 등): 자율적으로 추가 가능, PR 메시지에 근거 명시
- 큰 의존성 (ORM, 상태관리, 테스트 러너 등): 사용자 확인 필수

---

## 환경 변수

`.env.example`을 참고해서 `.env.local`을 만듭니다. 누락 시 `lib/env.ts`에서 런타임 에러를 던집니다.

필수 키 (상세는 `.env.example` 참고):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (서버 전용)
- `DAILY_SESSION_SALT` (매일 교체되는 해시 솔트 — 자세한 내용은 `docs/ARCHITECTURE.md`의 "세션 해시" 섹션)
- `NEXT_PUBLIC_APP_URL`

---

## 이 프로젝트의 잘 안 보이는 함정들 (Gotchas)

Claude Code는 이것들을 기억하고 작업합니다:

1. **"오늘의 질문"은 UTC 기준**: `new Date().toISOString().slice(0,10)`을 사용. 절대 서버 로컬 시간 쓰지 말 것.

2. **Cloudflare 뒤에서만 동작**: `request.headers.get('cf-ipcountry')`로 국가 코드 획득. 로컬 개발 시 `DEV_COUNTRY_OVERRIDE` 환경변수로 시뮬레이션.

3. **응답 후에만 결과 API 접근 가능**: `/api/results/:id`는 세션이 해당 질문에 응답한 경우에만 200을 돌려줌. 아니면 403.

4. **중복 응답은 DB UNIQUE 제약으로 방어**: `UNIQUE (question_id, session_hash)`. 클라이언트 검증은 UX용, 진실은 DB에서.

5. **집계 테이블(`daily_aggregates`)은 뷰가 아니라 실테이블**: 응답 INSERT 시 트리거 또는 주기 집계로 갱신. 초기엔 요청마다 집계 쿼리 허용, 트래픽 늘면 트리거 전환 ([`docs/DECISIONS.md#ADR-004`](./docs/DECISIONS.md)).

6. **OG 이미지는 동적 생성**: `/api/og/:id?option=...`. Edge Runtime으로 빌드됨. `@vercel/og` 사용법 주의.

7. **`[locale]` 라우트 세그먼트**: 모든 페이지가 여기 아래에 들어감. 루트에 페이지 만들지 말 것.

8. **Server Action 사용 금지 (현 Phase)**: API Routes만 사용. Server Action으로 전환은 ADR 필요.

---

## 문서 자체에 변경이 필요하면

- 컨벤션/결정 변경: `docs/DECISIONS.md`에 새 ADR 추가 + 관련 문서 업데이트
- 새 태스크 등장: `docs/ROADMAP.md`에 추가
- 이 CLAUDE.md 자체 수정: 변경 사유를 커밋 메시지에 명시
