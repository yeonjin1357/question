-- =====================================================================
-- seed.sql  —  LOCAL DEVELOPMENT ONLY
-- =====================================================================
-- 이 파일은 개발용 시드입니다. 프로덕션 DB 에는 절대 주입하지 마세요.
-- 3 개의 질문 (yesterday / today / tomorrow) + 500 개의 랜덤 응답을
-- 생성합니다. docs/QUESTIONS.md §6 참고.
--
-- 모든 UUID 는 v4 포맷 (버전 4, variant 8) — Zod 의 z.uuid() 스트릭트 검증 통과.
-- =====================================================================

begin;

-- 재실행 가능하도록 기존 데이터 제거. questions FK CASCADE 로 연쇄 삭제.
delete from responses;
delete from daily_aggregates;
delete from questions;
delete from suggestions;

-- ---------------------------------------------------------------------
-- Q1: 어제 (archived) — Day 1 "신발"
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status)
values (
  '11111111-1111-4111-8111-111111111111',
  (now() at time zone 'utc')::date - 1,
  'habits',
  'archived'
);

insert into question_translations (question_id, locale, text) values
  ('11111111-1111-4111-8111-111111111111', 'en', 'Do you wear shoes inside your house?'),
  ('11111111-1111-4111-8111-111111111111', 'ko', '집에 들어갈 때 신발을 신은 채로 들어가나요?');

insert into options (id, question_id, sort_order) values
  ('a0000001-0001-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 1),
  ('a0000001-0002-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 2),
  ('a0000001-0003-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 3);

insert into option_translations (option_id, locale, text) values
  ('a0000001-0001-4000-8000-000000000001', 'en', 'Yes, always'),
  ('a0000001-0001-4000-8000-000000000001', 'ko', '항상 신고 들어감'),
  ('a0000001-0002-4000-8000-000000000002', 'en', 'Only sometimes'),
  ('a0000001-0002-4000-8000-000000000002', 'ko', '가끔 신고 들어감'),
  ('a0000001-0003-4000-8000-000000000003', 'en', 'No, never'),
  ('a0000001-0003-4000-8000-000000000003', 'ko', '절대 신고 들어가지 않음');

-- ---------------------------------------------------------------------
-- Q2: 오늘 (live) — Day 2 "양치 물"
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status)
values (
  '22222222-2222-4222-8222-222222222222',
  (now() at time zone 'utc')::date,
  'habits',
  'live'
);

insert into question_translations (question_id, locale, text) values
  ('22222222-2222-4222-8222-222222222222', 'en', 'Do you leave the water running while brushing your teeth?'),
  ('22222222-2222-4222-8222-222222222222', 'ko', '양치할 때 물을 계속 틀어두나요?');

insert into options (id, question_id, sort_order) values
  ('a0000002-0001-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 1),
  ('a0000002-0002-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 2);

insert into option_translations (option_id, locale, text) values
  ('a0000002-0001-4000-8000-000000000001', 'en', 'Yes'),
  ('a0000002-0001-4000-8000-000000000001', 'ko', '네'),
  ('a0000002-0002-4000-8000-000000000002', 'en', 'No'),
  ('a0000002-0002-4000-8000-000000000002', 'ko', '아니요');

-- ---------------------------------------------------------------------
-- Q3: 내일 (scheduled) — Day 3 "파인애플 피자"
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status)
values (
  '33333333-3333-4333-8333-333333333333',
  (now() at time zone 'utc')::date + 1,
  'food',
  'scheduled'
);

insert into question_translations (question_id, locale, text) values
  ('33333333-3333-4333-8333-333333333333', 'en', 'How do you feel about pineapple on pizza?'),
  ('33333333-3333-4333-8333-333333333333', 'ko', '파인애플 피자, 어떻게 생각해요?');

insert into options (id, question_id, sort_order) values
  ('a0000003-0001-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 1),
  ('a0000003-0002-4000-8000-000000000002', '33333333-3333-4333-8333-333333333333', 2),
  ('a0000003-0003-4000-8000-000000000003', '33333333-3333-4333-8333-333333333333', 3);

insert into option_translations (option_id, locale, text) values
  ('a0000003-0001-4000-8000-000000000001', 'en', 'Love it'),
  ('a0000003-0001-4000-8000-000000000001', 'ko', '완전 좋아함'),
  ('a0000003-0002-4000-8000-000000000002', 'en', 'Hate it'),
  ('a0000003-0002-4000-8000-000000000002', 'ko', '완전 싫어함'),
  ('a0000003-0003-4000-8000-000000000003', 'en', 'Don''t care'),
  ('a0000003-0003-4000-8000-000000000003', 'ko', '상관없음');

-- ---------------------------------------------------------------------
-- Responses: 총 500 개를 Q1 (archived) 200 + Q2 (live) 300 으로 분배.
-- Q3 는 scheduled 이므로 응답 없음.
-- country_code 는 20 개 풀에서 랜덤, 8% 확률로 NULL (미식별 버킷).
-- session_hash 는 시드 식별자로부터 SHA-256 해시 → 64 자 hex.
-- ---------------------------------------------------------------------
do $$
declare
  i int;
  qid uuid;
  opts uuid[];
  chosen_opt uuid;
  country_pool char(2)[] := array[
    'KR','US','JP','GB','DE','FR','BR','IN','CA','AU',
    'CN','MX','IT','ES','NL','SE','SG','NG','TR','RU'
  ];
  chosen_country char(2);
begin
  -- Q1: 200 응답
  qid := '11111111-1111-4111-8111-111111111111';
  select array_agg(id order by sort_order) into opts from options where question_id = qid;
  for i in 1..200 loop
    chosen_opt := opts[1 + floor(random() * array_length(opts, 1))::int];
    chosen_country := case
      when random() < 0.08 then null
      else country_pool[1 + floor(random() * array_length(country_pool, 1))::int]
    end;
    insert into responses (question_id, option_id, country_code, session_hash)
    values (
      qid,
      chosen_opt,
      chosen_country,
      encode(sha256(('seed-q1-' || i)::bytea), 'hex')
    );
  end loop;

  -- Q2: 300 응답
  qid := '22222222-2222-4222-8222-222222222222';
  select array_agg(id order by sort_order) into opts from options where question_id = qid;
  for i in 1..300 loop
    chosen_opt := opts[1 + floor(random() * array_length(opts, 1))::int];
    chosen_country := case
      when random() < 0.08 then null
      else country_pool[1 + floor(random() * array_length(country_pool, 1))::int]
    end;
    insert into responses (question_id, option_id, country_code, session_hash)
    values (
      qid,
      chosen_opt,
      chosen_country,
      encode(sha256(('seed-q2-' || i)::bytea), 'hex')
    );
  end loop;
end $$;

commit;
