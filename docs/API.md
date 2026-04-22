# API Specification

모든 엔드포인트는 `/api/*`. JSON 통신. 인증은 세션 쿠키 기반 (현 Phase).

공통 응답 포맷:
```ts
// 성공
{ data: T }

// 에러
{ error: { code: string; message: string; details?: unknown } }
```

---

## 공통 에러 코드

| 코드 | HTTP | 의미 |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Zod 검증 실패 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `FORBIDDEN` | 403 | 권한 없음 (답 안 하고 결과 요청 등) |
| `DUPLICATE_RESPONSE` | 409 | 이미 답한 질문 |
| `RATE_LIMITED` | 429 | 레이트 리밋 초과 |
| `INTERNAL_ERROR` | 500 | 서버 오류 |

---

## `GET /api/today`

오늘의 질문, 선택지, 내 응답 상태, 다음 질문까지 남은 시간 반환.

### Query
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `locale` | `string` | N | 미지정 시 `Accept-Language` 파싱, 최종 폴백 `en` |

### 200 응답
```json
{
  "data": {
    "question": {
      "id": "uuid",
      "text": "Do you wear shoes inside your house?",
      "category": "habits",
      "publishDate": "2026-04-18"
    },
    "options": [
      { "id": "uuid", "text": "Yes, always", "sortOrder": 0 },
      { "id": "uuid", "text": "Only sometimes", "sortOrder": 1 },
      { "id": "uuid", "text": "No, never", "sortOrder": 2 }
    ],
    "myResponse": {
      "optionId": "uuid"
    },
    "secondsUntilNext": 43200,
    "isTranslationFallback": false
  }
}
```

`myResponse`는 답했을 때만, 안 했으면 `null`.

### 404
오늘 `status='live'`인 질문이 없을 때. 운영 장애 상황.

---

## `POST /api/responses`

응답 제출. 성공하면 결과도 함께 반환 (round-trip 최소화).

### Body
```ts
{
  questionId: string; // uuid
  optionId:   string; // uuid
}
```

Zod 검증 실패 시 400.

### 헤더
- `cf-ipcountry`: Cloudflare 앞단이 있을 때 자동 주입
- `x-vercel-ip-country`: Cloudflare 없을 때의 fallback (Vercel 기본 제공)
- 로컬 개발: `DEV_COUNTRY_OVERRIDE` 환경변수로 시뮬레이션

### 201 응답
```json
{
  "data": {
    "response": {
      "id": "uuid",
      "optionId": "uuid"
    },
    "results": {
      "global": [
        { "optionId": "uuid-a", "count": 1234, "percent": 61.7 },
        { "optionId": "uuid-b", "count": 766, "percent": 38.3 }
      ],
      "byCountry": [
        {
          "country": "KR",
          "total": 450,
          "options": [
            { "optionId": "uuid-a", "count": 306, "percent": 68.0 },
            { "optionId": "uuid-b", "count": 144, "percent": 32.0 }
          ]
        }
      ]
    }
  }
}
```

### 409 응답
```json
{
  "error": {
    "code": "DUPLICATE_RESPONSE",
    "message": "You already answered today's question.",
    "details": { "previousOptionId": "uuid" }
  }
}
```

---

## `GET /api/results/:questionId`

결과 조회. **답한 사용자만 접근 가능.**

### Path
- `:questionId` — UUID

### 200 응답
`POST /api/responses`의 `results` 필드와 동일 구조.

### 403 응답
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Answer the question first to see results."
  }
}
```

---

## `GET /api/archive`

지난 질문 목록.

### Query
| 필드 | 타입 | 기본 | 설명 |
|---|---|---|---|
| `locale` | string | auto | |
| `cursor` | string | - | 페이지네이션 커서 (이전 응답의 `nextCursor`) |
| `limit` | number | 20 | 최대 50 |
| `category` | string | - | `food`, `habits`, ... |

### 200 응답
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "publishDate": "2026-04-17",
        "text": "...",
        "category": "food",
        "totalResponses": 3421,
        "topCountry": "BR"
      }
    ],
    "nextCursor": "2026-04-10"
  }
}
```

---

## `POST /api/suggestions`

질문 제안 제출.

### Body
```ts
{
  questionText: string;   // 10~200자
  options: Array<{        // 2~4개
    text: string;         // 1~50자
  }>;
  locale: string;         // 'en' | 'ko' | ...
  submitterEmail?: string; // 승인 알림용
}
```

### 레이트 리밋
같은 `ip_hash`에서 24시간 내 3건까지.

### 201 응답
```json
{
  "data": {
    "id": "uuid",
    "status": "pending"
  }
}
```

---

## `GET /api/og/:questionId`

공유용 OG 이미지 (PNG). Edge Runtime.

### Path
- `:questionId` — UUID

### Query
| 필드 | 설명 |
|---|---|
| `opt` | 강조할 옵션 ID (선택) |
| `country` | 강조할 국가 코드 (선택) |
| `locale` | 언어 |

### 응답
`image/png`, 1200×630.

---

## `POST /api/admin/questions` (Phase 2+)

관리자 전용. 질문 생성/스케줄링.

### 인증
`Authorization: Bearer <admin-token>` 또는 세션 쿠키 (관리자 이메일).

### Body
```ts
{
  publishDate: string;   // 'YYYY-MM-DD', 미래 날짜
  category: string;
  translations: Array<{
    locale: string;
    text: string;
  }>;
  options: Array<{
    sortOrder: number;
    translations: Array<{ locale: string; text: string }>;
  }>;
}
```

### 201 응답
```json
{ "data": { "id": "uuid", "publishDate": "2026-05-01" } }
```

---

## `PATCH /api/admin/suggestions/:id` (Phase 2+)

제안 승인/거절.

### Body
```ts
{
  status: "approved" | "rejected";
  adminNote?: string;
  scheduledFor?: string; // 승인 시 publishDate
}
```

---

## 레이트 리밋 정책 (요약)

| 엔드포인트 | 윈도우 | 제한 |
|---|---|---|
| `GET /api/today` | 1분 | 60 |
| `POST /api/responses` | 1분 | 5 |
| `GET /api/results/:id` | 1분 | 30 |
| `POST /api/suggestions` | 24시간 | 3 |
| 관리자 엔드포인트 | - | 없음 |

초과 시 429 + `Retry-After` 헤더.
