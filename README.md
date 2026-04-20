# One Question a Day 🌍

> 매일 하나의 질문. 전 세계의 답. 10초면 참여 끝.

매일 UTC 00:00에 단 하나의 질문이 전 세계에 공개됩니다. 답하고 나면 세계지도 위에 국가별 응답 비율이 펼쳐집니다.

## ✨ 이런 곳입니다

- **질문은 단 하나** — 매일 UTC 00:00에 교체. 응답은 세션당 1회.
- **전 세계 시각화** — 응답 직후 바로 바 차트 + 세계지도 등장.
- **프라이버시 우선** — 계정 없음, 쿠키는 꼭 필요한 한 개, IP는 해시된 형태로만 저장.
- **4개 언어 지원** — en / ko / ja / es (next-intl). 질문은 최소 en + ko.

## 🚀 시작하기

### 요구사항

- Node.js 20+
- npm
- Supabase 계정 (무료 티어)

### 설치

```bash
git clone https://github.com/yeonjin1357/question.git
cd question
npm install
cp env.example .env.local
# .env.local을 편집: NEXT_PUBLIC_SUPABASE_URL, _ANON_KEY, SERVICE_ROLE_KEY, SESSION_HASH_SECRET
npm run db:migrate
npm run db:seed
npm run dev
```

http://localhost:3000 에서 확인. (`/` 루트로 접근하면 브라우저 언어에 맞춰 `/ko`, `/en` 등으로 자동 리다이렉트됩니다.)

### 주요 명령

```bash
npm run dev              # 개발 서버
npm run build            # 프로덕션 빌드
npm run typecheck        # tsc --noEmit
npm run lint             # ESLint
npm run test             # Vitest 단위 테스트
npm run i18n:check       # locale 메시지 누락 감지
npm run a11y             # 휴리스틱 a11y 점검
```

## 🏗️ 기술 스택

- **Framework**: Next.js 14 (App Router) + TypeScript strict
- **Styling**: Tailwind CSS + Space Grotesk (display) + Geist (body)
- **Motion**: framer-motion, canvas-confetti
- **Icons**: lucide-react
- **Database**: Supabase (PostgreSQL + RLS)
- **Hosting**: Vercel + Cloudflare (CF-IPCountry 헤더로 국가 감지)
- **i18n**: next-intl
- **Monitoring**: Plausible (선택), Sentry (선택)

자세한 내용은 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) 참조.

## 📂 프로젝트 문서

| 문서 | 내용 |
|---|---|
| [CLAUDE.md](./CLAUDE.md) | AI 에이전트 작업 지침 |
| [docs/PRD.md](./docs/PRD.md) | 제품 요구사항 |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 기술 아키텍처 |
| [docs/DATABASE.md](./docs/DATABASE.md) | DB 스키마 |
| [docs/API.md](./docs/API.md) | API 명세 |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | 개발 로드맵 |
| [docs/CONVENTIONS.md](./docs/CONVENTIONS.md) | 코드 컨벤션 |
| [docs/DECISIONS.md](./docs/DECISIONS.md) | 의사결정 기록 (ADR) |
| [docs/QUESTIONS.md](./docs/QUESTIONS.md) | 질문 작성 가이드 |

## 📜 라이선스

MIT

## 🤝 기여

- **질문 제안**: `/suggest` 페이지에서 누구나 가능. 승인 후 반영됩니다.
- **코드 기여**: Pull Request 환영. `npm run typecheck && lint && test` 통과 필수.
- **버그/건의**: GitHub Issues.
