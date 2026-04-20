# One Question a Day 🌍

> 매일 하나의 질문. 전 세계의 답. 10초면 참여 끝.

매일 UTC 00:00에 단 하나의 질문이 전 세계에 공개됩니다. 답하고 나면 세계지도 위에 국가별 응답 비율이 펼쳐집니다.

## 🚀 시작하기

### 요구사항
- Node.js 20+
- npm (또는 pnpm)
- Supabase 계정 (무료 티어)

### 설치

```bash
git clone https://github.com/<your-username>/one-question-a-day.git
cd one-question-a-day
npm install
cp .env.example .env.local
# .env.local을 편집하여 Supabase 키 입력
npm run db:migrate
npm run db:seed
npm run dev
```

http://localhost:3000 에서 확인.

## 🏗️ 기술 스택

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel + Cloudflare
- **i18n**: next-intl

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
| [docs/DECISIONS.md](./docs/DECISIONS.md) | 의사결정 기록(ADR) |
| [docs/QUESTIONS.md](./docs/QUESTIONS.md) | 질문 작성 가이드 |

## 📜 라이선스

MIT

## 🤝 기여

질문 제안은 [/suggest](#) 페이지 또는 Issue로. 코드 기여는 Pull Request 환영.
