# Database

PostgreSQL 17 (Supabase 기준). 모든 DDL은 `supabase/migrations/` 순번 파일로 관리.

---

## 1. 엔티티 개요

```
questions (1) ─< question_translations (*)
          └─< options (*) ─< option_translations (*)
          └─< responses (*)
          └─< daily_aggregates (*)

suggestions (독립)
```

---

## 2. 스키마

### 2.1 `questions`
하루에 정확히 하나의 레코드가 `status='live'`인 것이 정상.

```sql
CREATE TYPE question_status AS ENUM ('scheduled', 'live', 'archived');

CREATE TABLE questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publish_date  DATE UNIQUE NOT NULL,
  category      TEXT NOT NULL,
  status        question_status NOT NULL DEFAULT 'scheduled',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_publish_date ON questions(publish_date DESC);
```

**라이프사이클**
- `scheduled` → 미래의 `publish_date`
- `live` → `publish_date == today_utc`
- `archived` → `publish_date < today_utc`

**Cron Job (하루 1회 UTC 00:00)**: `scheduled` 중 오늘 날짜인 것 → `live`, 기존 `live` → `archived`.

### 2.2 `question_translations`
```sql
CREATE TABLE question_translations (
  question_id  UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  locale       TEXT NOT NULL,
  text         TEXT NOT NULL CHECK (length(text) BETWEEN 3 AND 200),
  PRIMARY KEY (question_id, locale)
);

CREATE INDEX idx_question_translations_locale ON question_translations(locale);
```

최소한 `locale='en'`은 반드시 존재해야 함 (애플리케이션 레벨 검증).

### 2.3 `options`
```sql
CREATE TABLE options (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  sort_order   SMALLINT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (question_id, sort_order)
);

CREATE INDEX idx_options_question_id ON options(question_id);
```

한 질문당 옵션 2~4개 (CHECK 제약은 애플리케이션에서 검증 — trigger로 강제해도 됨).

### 2.4 `option_translations`
```sql
CREATE TABLE option_translations (
  option_id  UUID NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  locale     TEXT NOT NULL,
  text       TEXT NOT NULL CHECK (length(text) BETWEEN 1 AND 50),
  PRIMARY KEY (option_id, locale)
);
```

### 2.5 `responses`
```sql
CREATE TABLE responses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id    UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_id      UUID NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  country_code   CHAR(2),
  session_hash   TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (question_id, session_hash)
);

CREATE INDEX idx_responses_qid_country ON responses(question_id, country_code);
CREATE INDEX idx_responses_qid_option ON responses(question_id, option_id);
CREATE INDEX idx_responses_created_at ON responses(created_at);
```

**주의**
- `session_hash`만 저장. IP 원문, User-Agent 원문은 저장하지 않는다.
- `country_code`는 ISO 3166-1 alpha-2. Cloudflare가 식별 불가하면 `NULL`.

### 2.6 `daily_aggregates` (성능용, Phase B부터 사용)
```sql
CREATE TABLE daily_aggregates (
  question_id   UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_id     UUID NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  country_code  CHAR(2),  -- NULL = unknown 버킷
  count         INTEGER NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- NULL 버킷을 허용하려면 PRIMARY KEY 대신 UNIQUE NULLS NOT DISTINCT 사용.
  -- (PK 는 모든 컬럼을 NOT NULL 로 강제하므로 country_code 가 NULL 이면 사용 불가)
  UNIQUE NULLS NOT DISTINCT (question_id, option_id, country_code)
);

CREATE INDEX idx_daily_agg_question ON daily_aggregates(question_id);
```

**갱신 방법** (Phase B):
```sql
-- Trigger 방식 (각 응답마다)
CREATE FUNCTION increment_aggregate() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_aggregates (question_id, option_id, country_code, count)
  VALUES (NEW.question_id, NEW.option_id, NEW.country_code, 1)
  ON CONFLICT (question_id, option_id, country_code)
  DO UPDATE SET count = daily_aggregates.count + 1, updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_responses_aggregate
  AFTER INSERT ON responses
  FOR EACH ROW EXECUTE FUNCTION increment_aggregate();
```

### 2.7 `suggestions`
```sql
CREATE TYPE suggestion_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE suggestions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text   TEXT NOT NULL CHECK (length(question_text) BETWEEN 10 AND 200),
  options_json    JSONB NOT NULL, -- [{text, sort_order}, ...]
  locale          TEXT NOT NULL,
  submitter_email TEXT,
  status          suggestion_status NOT NULL DEFAULT 'pending',
  admin_note      TEXT,
  ip_hash         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at     TIMESTAMPTZ,
  scheduled_for   DATE
);

CREATE INDEX idx_suggestions_status ON suggestions(status);
CREATE INDEX idx_suggestions_ip_hash_date ON suggestions(ip_hash, created_at);
```

---

## 3. Row Level Security (RLS) 정책

```sql
-- 전체 테이블 RLS 활성화
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- anon: questions 읽기 (live/archived만)
CREATE POLICY questions_anon_read ON questions
  FOR SELECT TO anon
  USING (status IN ('live', 'archived'));

-- anon: translations 읽기 (부모 질문이 live/archived인 경우)
CREATE POLICY qtrans_anon_read ON question_translations
  FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM questions q
    WHERE q.id = question_id AND q.status IN ('live', 'archived')
  ));

-- 옵션 및 옵션 번역도 동일 패턴
CREATE POLICY options_anon_read ON options
  FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM questions q
    WHERE q.id = question_id AND q.status IN ('live', 'archived')
  ));

-- responses: anon은 SELECT 불가. INSERT만 서버 route 통해서.
-- (route에서 service role 사용, RLS 우회)

-- suggestions: anon은 INSERT만 가능
CREATE POLICY suggestions_anon_insert ON suggestions
  FOR INSERT TO anon WITH CHECK (true);
```

**중요**: API route에서 `responses`, 관리 작업은 service role로 수행. RLS는 클라이언트 직접 접근 방어용.

---

## 4. 자주 쓰는 쿼리

### 4.1 오늘의 질문 + 옵션 + 번역
```sql
SELECT
  q.id, q.publish_date, q.category,
  qt.text AS question_text,
  json_agg(json_build_object(
    'id', o.id,
    'sort_order', o.sort_order,
    'text', ot.text
  ) ORDER BY o.sort_order) AS options
FROM questions q
LEFT JOIN question_translations qt
  ON qt.question_id = q.id AND qt.locale = $1
LEFT JOIN options o ON o.question_id = q.id
LEFT JOIN option_translations ot
  ON ot.option_id = o.id AND ot.locale = $1
WHERE q.status = 'live'
GROUP BY q.id, qt.text
LIMIT 1;
```

### 4.2 결과 집계 (Phase A: 실시간)
```sql
-- 전체
SELECT option_id, COUNT(*) AS cnt
FROM responses
WHERE question_id = $1
GROUP BY option_id;

-- 국가별
SELECT country_code, option_id, COUNT(*) AS cnt
FROM responses
WHERE question_id = $1 AND country_code IS NOT NULL
GROUP BY country_code, option_id;
```

### 4.3 결과 집계 (Phase B: 사전 집계)
```sql
SELECT option_id, country_code, count
FROM daily_aggregates
WHERE question_id = $1;
```

---

## 5. 시드 데이터

`supabase/seed.sql`에 개발용 시드 스크립트:
- `questions` 3개: 어제(archived), 오늘(live), 내일(scheduled)
- 각 질문에 옵션 2–4개
- `responses` 500개 랜덤 (개발 중 지도/차트 보려고)

구체적인 시드 질문 내용은 [`QUESTIONS.md`](./QUESTIONS.md)의 "개발 시드" 섹션 참조.

---

## 6. 백업 & 복구

- Supabase 자동 백업 (Pro 플랜부터 일일). 무료 플랜은 수동 pg_dump 주 1회.
- 복구 시나리오는 ADR-005에서 다룸.
