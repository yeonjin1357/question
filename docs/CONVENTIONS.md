# 코드 컨벤션

## 1. TypeScript

### 1.1 필수 설정 (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### 1.2 타입 작성 규칙
- `any` 금지. 진짜 모르겠으면 `unknown` + 타입 가드
- `as` 타입 단언 최소화. 정말 필요하면 주석으로 근거
- 함수 반환 타입 명시 선호 (특히 public API)
- 인터페이스 vs 타입 alias: 확장 가능한 객체는 `interface`, 유니온/교차는 `type`
- Enum은 쓰지 말고 `as const` 객체 또는 유니온 스트링 리터럴

```ts
// Bad
enum Status { Live = "live", Archived = "archived" }

// Good
const STATUS = { LIVE: "live", ARCHIVED: "archived" } as const;
type Status = typeof STATUS[keyof typeof STATUS];
```

### 1.3 에러 핸들링
- try/catch 대신 가능하면 Result 패턴
- API route에서는 try/catch 허용, 마지막에 공통 에러 응답

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

---

## 2. React / Next.js

### 2.1 Server vs Client
- **기본은 Server Component**
- `"use client"`는 다음 중 하나에 해당할 때만:
  - `useState`, `useEffect`, `useReducer` 등 훅 사용
  - 이벤트 핸들러 필요
  - 브라우저 전용 API 사용 (localStorage, window)
- Client Component는 최대한 leaf에 가깝게. 큰 트리를 클라이언트로 만들지 말 것.

### 2.2 컴포넌트 파일 구조
```tsx
// src/components/question/QuestionCard.tsx
import type { Question } from "@/types/domain";

interface QuestionCardProps {
  question: Question;
  className?: string;
}

export function QuestionCard({ question, className }: QuestionCardProps) {
  // ...
}
```

- 기본 내보내기 대신 named export 선호
- props 인터페이스는 `<ComponentName>Props`

### 2.3 훅
- `src/hooks/` 하위, 파일당 하나
- 반환값은 객체 또는 튜플. 3개 이상이면 객체.

### 2.4 스타일
- Tailwind 클래스만 사용. `styled-components`, CSS Modules 금지.
- `clsx` 또는 `cn` 헬퍼로 조건부 클래스
- 긴 클래스 리스트는 변수로 추출

```ts
const buttonBase = "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium";
```

### 2.5 접근성
- 모든 인터랙티브 요소는 키보드 접근 가능
- `<button>` vs `<a>` 구분 (action vs navigation)
- `aria-label` 필요한 곳에 반드시
- 색에만 의존하지 말 것 (텍스트, 패턴 병행)

---

## 3. 네이밍

| 종류 | 스타일 | 예시 |
|---|---|---|
| 컴포넌트 파일 | PascalCase.tsx | `QuestionCard.tsx` |
| 훅 파일 | useKebab 또는 useCamel | `useCountdown.ts` |
| 유틸 파일 | kebab-case.ts | `compute-hash.ts`, `format-date.ts` |
| 타입 파일 | kebab-case.ts | `database.ts`, `domain.ts` |
| 라우트 폴더 | kebab-case | `archive/`, `about/` |
| 상수 | SCREAMING_SNAKE | `DAILY_SALT_PREFIX` |
| 변수/함수 | camelCase | `computeHash`, `userLocale` |
| 타입/인터페이스 | PascalCase | `Question`, `ResponsePayload` |
| DB 테이블/컬럼 | snake_case | `question_translations` |

---

## 4. Import 순서

ESLint로 자동 정렬. 순서:

```ts
// 1. Node built-ins
import { createHash } from "node:crypto";

// 2. 외부 패키지
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// 3. 내부 절대경로
import { env } from "@/lib/env";
import { supabaseServer } from "@/lib/db/server";

// 4. 상대경로
import { validateResponse } from "./validator";

// 5. 타입만 (import type)
import type { Database } from "@/types/database";
```

---

## 5. 파일 크기 & 책임

- 컴포넌트 파일: **200줄 이하** 권장. 넘어가면 하위 컴포넌트로 분리.
- 유틸 파일: **150줄 이하**. 관련 없는 함수는 다른 파일로.
- API route: 라우트 자체는 얇게 (50줄 이하). 로직은 `lib/` 하위.
- **파일당 하나의 주 export**. 여러 컴포넌트 한 파일에 담지 말 것.

---

## 6. 주석

- **무엇(what)은 쓰지 말고 왜(why)만 써라**
- 자명한 코드에 주석 붙이지 말 것
- 공개 함수/복잡한 알고리즘은 JSDoc

```ts
/**
 * 세션 해시를 계산합니다. 매일 다른 솔트를 사용하므로
 * 같은 사용자라도 날짜별 해시가 다릅니다. 이는 의도된 설계입니다.
 * @see docs/ARCHITECTURE.md §5.2
 */
export function computeSessionHash(ip: string, ua: string): string {
  // ...
}
```

---

## 7. 테스트

### 7.1 단위 테스트 (Vitest)
- 순수 함수, 유틸, 훅 로직
- 파일명: `<name>.test.ts` 같은 디렉토리

```ts
// src/lib/session/hash.test.ts
import { describe, it, expect } from "vitest";
import { computeSessionHash } from "./hash";

describe("computeSessionHash", () => {
  it("returns the same hash for the same input within one day", () => {
    // ...
  });
});
```

### 7.2 통합 테스트
- API route 테스트는 Next.js 14에서 까다로움. 핵심 로직만 단위 테스트로 충분.
- DB 관련은 Supabase local + truncate 전략

### 7.3 E2E (Playwright)
- 핵심 플로우만: 질문 보기 → 답하기 → 결과 확인 → 공유
- 스크린샷으로 시각 회귀 방지 (선택적)

### 7.4 무엇을 테스트하지 않는가
- 타입만 검증하면 되는 것 (tsc에 맡김)
- UI 텍스트 변경 (메시지 파일에 있음)
- 서드파티 라이브러리 자체의 동작

---

## 8. Git

### 8.1 브랜치
- `main` (프로덕션)
- `feat/<짧은-설명>`
- `fix/<짧은-설명>`
- `chore/<...>`, `refactor/<...>`, `docs/<...>`

### 8.2 커밋 메시지 (Conventional Commits)
```
<type>(<scope>): <subject>

<body>

<footer>
```

type: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

예:
```
feat(responses): add duplicate detection with session hash

Implements 3-layer defense:
1. localStorage marker
2. httpOnly session cookie
3. DB UNIQUE constraint

Closes #12
```

### 8.3 PR 체크리스트
PR 설명에 다음 항목 포함:
- [ ] `typecheck`, `lint`, `test` 통과
- [ ] 관련 태스크 번호 (T-XXX)
- [ ] 스키마 변경 있으면 마이그레이션 파일 포함
- [ ] ADR 필요한 결정은 docs/DECISIONS.md 업데이트
- [ ] CLAUDE.md 업데이트 필요 여부 체크

---

## 9. 보안 필수 규칙

1. 사용자 입력은 반드시 Zod 검증
2. SQL은 Supabase 클라이언트 메서드만 사용 (raw SQL 지양, 불가피하면 파라미터화)
3. service role key는 서버에서만
4. `dangerouslySetInnerHTML` 금지. 필요하면 DOMPurify
5. 외부 링크는 `rel="noopener noreferrer"`
6. 환경 변수는 `lib/env.ts` 통해서만 접근

---

## 10. 성능 가이드라인

- 이미지는 `next/image`. 외부 이미지도 `remotePatterns` 설정 후 사용.
- 폰트는 `next/font` (Google Fonts 셀프호스팅)
- 컴포넌트 레벨 `React.memo`는 명확한 이유가 있을 때만
- `useMemo`, `useCallback`은 측정 후 도입. 기본적으로 쓰지 말 것.
- 리스트 렌더링 시 `key`는 의미 있는 값 (index는 피하기)
- 무한 스크롤/긴 리스트는 가상화 (`@tanstack/react-virtual`)
