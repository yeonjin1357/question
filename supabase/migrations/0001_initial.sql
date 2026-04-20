-- =====================================================================
-- 0001_initial.sql
-- 초기 스키마. docs/DATABASE.md §2 를 구현합니다.
-- =====================================================================

-- gen_random_uuid() 보장. Supabase는 기본 설치되어 있지만 idempotent.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- ENUM types
-- ---------------------------------------------------------------------
create type question_status as enum ('scheduled', 'live', 'archived');
create type suggestion_status as enum ('pending', 'approved', 'rejected');

-- ---------------------------------------------------------------------
-- questions
-- ---------------------------------------------------------------------
create table questions (
  id           uuid primary key default gen_random_uuid(),
  publish_date date unique not null,
  category     text not null,
  status       question_status not null default 'scheduled',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_questions_status on questions (status);
create index idx_questions_publish_date on questions (publish_date desc);

-- ---------------------------------------------------------------------
-- question_translations
-- ---------------------------------------------------------------------
create table question_translations (
  question_id uuid not null references questions (id) on delete cascade,
  locale      text not null,
  text        text not null check (length(text) between 3 and 200),
  primary key (question_id, locale)
);

create index idx_question_translations_locale on question_translations (locale);

-- ---------------------------------------------------------------------
-- options
-- ---------------------------------------------------------------------
create table options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions (id) on delete cascade,
  sort_order  smallint not null,
  created_at  timestamptz not null default now(),
  unique (question_id, sort_order)
);

create index idx_options_question_id on options (question_id);

-- ---------------------------------------------------------------------
-- option_translations
-- ---------------------------------------------------------------------
create table option_translations (
  option_id uuid not null references options (id) on delete cascade,
  locale    text not null,
  text      text not null check (length(text) between 1 and 50),
  primary key (option_id, locale)
);

-- ---------------------------------------------------------------------
-- responses
--   session_hash 만 저장 (IP/UA 원문 저장 금지). country_code 는
--   Cloudflare 가 식별 불가일 때 NULL 허용.
-- ---------------------------------------------------------------------
create table responses (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references questions (id) on delete cascade,
  option_id    uuid not null references options (id) on delete cascade,
  country_code char(2),
  session_hash text not null,
  created_at   timestamptz not null default now(),
  unique (question_id, session_hash)
);

create index idx_responses_qid_country on responses (question_id, country_code);
create index idx_responses_qid_option  on responses (question_id, option_id);
create index idx_responses_created_at  on responses (created_at);

-- ---------------------------------------------------------------------
-- daily_aggregates
--   ADR-004: Phase A 에서는 스키마만 준비, INSERT 트리거는 비활성화.
--   Phase B 진입 시 별도 마이그레이션으로 트리거 추가.
--
--   country_code 는 NULL 허용 (미식별 버킷). 따라서 PRIMARY KEY 대신
--   UNIQUE NULLS NOT DISTINCT 로 제약 — (Q, O, NULL) 쌍이 하나만 존재.
-- ---------------------------------------------------------------------
create table daily_aggregates (
  question_id  uuid not null references questions (id) on delete cascade,
  option_id    uuid not null references options (id) on delete cascade,
  country_code char(2),
  count        integer not null default 0,
  updated_at   timestamptz not null default now(),

  unique nulls not distinct (question_id, option_id, country_code)
);

create index idx_daily_agg_question on daily_aggregates (question_id);

-- ---------------------------------------------------------------------
-- suggestions
-- ---------------------------------------------------------------------
create table suggestions (
  id              uuid primary key default gen_random_uuid(),
  question_text   text not null check (length(question_text) between 10 and 200),
  options_json    jsonb not null,
  locale          text not null,
  submitter_email text,
  status          suggestion_status not null default 'pending',
  admin_note      text,
  ip_hash         text not null,
  created_at      timestamptz not null default now(),
  reviewed_at     timestamptz,
  scheduled_for   date
);

create index idx_suggestions_status       on suggestions (status);
create index idx_suggestions_ip_hash_date on suggestions (ip_hash, created_at);
