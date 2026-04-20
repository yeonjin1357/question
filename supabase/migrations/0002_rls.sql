-- =====================================================================
-- 0002_rls.sql
-- Row Level Security 활성화 및 anon 정책. docs/DATABASE.md §3 기준.
--
-- 원칙
--   - anon 은 live/archived 질문 및 그 번역/옵션만 읽을 수 있다.
--   - responses, daily_aggregates 는 anon 접근 전면 차단.
--     (API route 가 service_role 로 INSERT/SELECT 하므로 RLS 우회)
--   - suggestions 는 anon INSERT 만 허용, SELECT 는 차단.
-- =====================================================================

alter table questions              enable row level security;
alter table question_translations  enable row level security;
alter table options                enable row level security;
alter table option_translations    enable row level security;
alter table responses              enable row level security;
alter table daily_aggregates       enable row level security;
alter table suggestions            enable row level security;

-- ---------------------------------------------------------------------
-- questions: live / archived 만 읽기 허용
-- ---------------------------------------------------------------------
create policy questions_anon_read on questions
  for select
  to anon
  using (status in ('live', 'archived'));

-- ---------------------------------------------------------------------
-- question_translations: 부모 질문이 공개 상태일 때만
-- ---------------------------------------------------------------------
create policy question_translations_anon_read on question_translations
  for select
  to anon
  using (
    exists (
      select 1
      from questions q
      where q.id = question_translations.question_id
        and q.status in ('live', 'archived')
    )
  );

-- ---------------------------------------------------------------------
-- options: 부모 질문이 공개 상태일 때만
-- ---------------------------------------------------------------------
create policy options_anon_read on options
  for select
  to anon
  using (
    exists (
      select 1
      from questions q
      where q.id = options.question_id
        and q.status in ('live', 'archived')
    )
  );

-- ---------------------------------------------------------------------
-- option_translations: 부모 옵션의 부모 질문이 공개 상태일 때만
-- ---------------------------------------------------------------------
create policy option_translations_anon_read on option_translations
  for select
  to anon
  using (
    exists (
      select 1
      from options o
      join questions q on q.id = o.question_id
      where o.id = option_translations.option_id
        and q.status in ('live', 'archived')
    )
  );

-- ---------------------------------------------------------------------
-- responses: anon 접근 전면 차단.
--   정책을 하나도 만들지 않으면 RLS 활성 테이블은 모든 anon 쿼리가
--   빈 결과/거부가 된다. INSERT/SELECT 모두 service_role 경유.
-- ---------------------------------------------------------------------
-- (no policy)

-- ---------------------------------------------------------------------
-- daily_aggregates: anon 접근 전면 차단.
-- ---------------------------------------------------------------------
-- (no policy)

-- ---------------------------------------------------------------------
-- suggestions: anon INSERT 만 허용. 승인 상태 등 내부 정보는 비공개.
-- ---------------------------------------------------------------------
create policy suggestions_anon_insert on suggestions
  for insert
  to anon
  with check (true);
