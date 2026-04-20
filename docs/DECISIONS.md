# Architecture Decision Records (ADR)

중요한 설계 결정을 연대순으로 기록합니다. 형식: 컨텍스트 → 결정 → 결과.
새 ADR이 기존 결정을 뒤집을 때는 기존 ADR을 "Superseded by ADR-XXX"로 마킹.

---

## ADR-001: 하루의 기준을 UTC로 통일

**날짜**: 2026-04-18
**상태**: Accepted

### 컨텍스트
"One Question a Day"의 핵심은 전 세계가 **같은 질문**을 풀도록 하는 것. 타임존을 어떻게 다룰지 결정 필요.

### 고려한 옵션
1. **UTC 00:00 기준 전 세계 동일**
2. 사용자 로컬 자정 기준 (각자의 "오늘")
3. 특정 기준 타임존 (예: KST, PST)

### 결정
**UTC 00:00 기준 전 세계 동일 질문**.

### 근거
- 옵션 2는 집계가 파편화됨. 누군가의 "월요일 답"을 어떤 질문의 답으로 집계할지 모호.
- 옵션 3은 특정 지역 중심이라는 인상.
- UTC는 중립적이고, "세계는 한순간도 쉬지 않고 대답한다"는 서비스 철학에 맞음.

### 결과
- 사용자에겐 "다음 질문까지 N시간" 카운트다운을 로컬 타임으로 표시 (`Intl.DateTimeFormat`).
- 모든 DB 쿼리는 `CURRENT_DATE AT TIME ZONE 'UTC'` 기준.

---

## ADR-002: 인증 없는 익명 응답

**날짜**: 2026-04-18
**상태**: Accepted

### 컨텍스트
응답 시 사용자 식별 방식 필요. 로그인 강제 vs 익명.

### 결정
**MVP는 완전 익명. 계정은 Phase 3에서 선택적으로 추가.**

### 근거
- 참여 비용 최소화가 핵심 가치
- 10초 이내 답변이라는 UX 목표
- 로그인 벽은 리텐션에 치명적

### 트레이드오프
- 완벽한 1인 1표 불가능 → 수용. 중복 방지는 합리적 수준만.
- 개인 통계/스트릭 기능 불가 → Phase 3에서 선택적 계정으로 해결.

---

## ADR-003: 중복 응답 방지 — 3중 방어

**날짜**: 2026-04-18
**상태**: Accepted

### 컨텍스트
익명 사용자의 중복 응답을 어떻게 막을까. 완벽 불가능, 어디까지 대응할지.

### 결정
**localStorage + httpOnly 세션 쿠키 + DB UNIQUE 제약의 3중 방어**. VPN 전환/기기 변경은 허용.

### 근거
- 의도적 어뷰즈(봇, 스크립트)는 레이트 리밋으로 차단
- 쿠키 삭제로 재응답은 흔치 않음. 의도적 어뷰즈 시나리오
- 단일 대규모 조작만 막으면 통계적 의미 유지됨

### 결과
- `responses` 테이블 `UNIQUE (question_id, session_hash)` 제약
- `session_hash = sha256(ip + ua + daily_salt)`
- 상세: [`ARCHITECTURE.md §5`](./ARCHITECTURE.md)

---

## ADR-004: 집계는 실시간 쿼리로 시작, 트래픽 증가 시 테이블로 전환

**날짜**: 2026-04-18
**상태**: Accepted

### 컨텍스트
응답 결과를 어떻게 집계할까. 실시간 `GROUP BY` vs 사전 집계 테이블.

### 결정
**Phase A (일일 응답 <5,000): 실시간 GROUP BY + Next.js fetch 캐시 60초**
**Phase B (이상): `daily_aggregates` 테이블 + INSERT 트리거**

### 근거
- 초기 복잡도 최소화
- 측정 후 최적화 원칙
- 트리거는 디버깅이 어려워서 필요할 때만

### 전환 기준
다음 중 하나라도 해당 시 Phase B로:
- 일일 응답 5,000 초과
- p95 결과 조회 latency > 500ms
- Supabase 쿼리 비용 급증

### 결과
- 지금은 `daily_aggregates` 스키마만 준비, 트리거 비활성화
- Phase B 전환 시 ADR 업데이트

---

## ADR-005: Server Action 미사용, API Route만

**날짜**: 2026-04-18
**상태**: Accepted

### 컨텍스트
Next.js 14의 Server Action을 쓸지 말지.

### 결정
**현 Phase에서는 쓰지 않음.** API Route만 사용.

### 근거
- Server Action은 호출 디버깅이 어려움 (네트워크 탭에 트레이스 불명확)
- 외부에서 호출할 수 없음 (나중에 모바일 앱, Public API 시 재작업)
- 에러 핸들링 관례가 아직 덜 정착됨
- REST API는 친숙하고 검증된 패턴

### 재검토 조건
- Form 상태 관리가 복잡해져서 Server Action이 현저히 편해질 때
- 팀이 성장해 Server Action 패턴이 표준화될 때

---

## ADR-006: i18n 라이브러리로 next-intl

**날짜**: 2026-04-18
**상태**: Accepted

### 컨텍스트
App Router에서 i18n 라이브러리 선택. 후보: `next-intl`, `next-i18next`, 자체 구현.

### 결정
**`next-intl`**.

### 근거
- App Router 네이티브 지원
- Server Component와 Client Component 모두 지원
- 메시지 포매팅 (ICU Message Syntax)
- 활발한 유지보수

### 대안 평가
- `next-i18next`: Pages Router 중심, App Router 지원 아직 미흡
- 자체 구현: 번들/재발명 비용이 가치보다 큼

---

## ADR-007: 레이트 리밋 — 초기엔 인메모리, 성장 시 Redis

**날짜**: 2026-04-18
**상태**: Accepted

### 컨텍스트
Vercel 서버리스 환경에서 레이트 리밋. 프로세스별 메모리는 완벽하지 않음.

### 결정
**MVP: 프로세스별 인메모리 LRU. Phase 2에서 Upstash Redis 검토.**

### 근거
- 무료 티어 내에서 시작하고 싶음
- 공격자가 분산되어 있어도 각 리전/프로세스에서 어느 정도 억제됨
- 완벽한 글로벌 제한은 Upstash 무료 티어로 쉽게 전환 가능

### 전환 조건
- 명백한 어뷰즈 발생 (특정 IP가 여러 리전에서 동시 공격)
- DAU > 1,000

---

## ADR-008: 지오로케이션 — Cloudflare 헤더 전용

**날짜**: 2026-04-18
**상태**: Accepted

### 컨텍스트
국가 식별 방법.

### 결정
**Cloudflare `cf-ipcountry` 헤더만 사용.** 외부 지오로케이션 API 사용하지 않음.

### 근거
- 무료 (Cloudflare 무료 플랜에 포함)
- 빠름 (엣지에서 주입, 추가 API 콜 없음)
- 정확도 충분 (국가 수준)

### 요구사항
- 도메인은 반드시 Cloudflare 뒤에 있어야 함
- 로컬 개발은 `DEV_COUNTRY_OVERRIDE` 환경변수로 시뮬레이션

---

## ADR 템플릿 (새 ADR 작성 시 복사)

```markdown
## ADR-XXX: <제목>

**날짜**: YYYY-MM-DD
**상태**: Proposed | Accepted | Superseded by ADR-YYY

### 컨텍스트
<결정이 필요한 이유>

### 고려한 옵션
1. ...
2. ...
3. ...

### 결정
<선택된 옵션과 간단한 요약>

### 근거
<왜 이것을 선택했는지>

### 결과
<이 결정이 가져올 구체적 영향>

### 재검토 조건 (선택)
<언제 이 결정을 다시 봐야 하는지>
```
