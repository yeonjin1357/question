-- =====================================================================
-- seed-launch-questions.sql — LAUNCH CONTENT (NOT AUTO-RUN)
-- =====================================================================
-- 런칭 첫 30일치 질문. `docs/QUESTIONS.md §5` 에서 가져온 en + ko 번역 포함.
--
-- 이 파일은 마이그레이션 디렉토리(supabase/migrations/) 에 **들어가지 않습니다**.
-- `supabase db push` 로 자동 적용되지 않도록 scripts/ 하위에 둔 의도적 배치입니다.
-- 실행은 사용자 검토 후 수동으로:
--
--   psql "$DATABASE_URL" -v start_date='2026-05-01' -f scripts/seed-launch-questions.sql
--
-- `:start_date` 가 Day 1 의 publish_date 가 되고, 이후 Day N 은 +N-1 일.
-- 최초 live 전환은 publish_date=:start_date 이 되는 UTC 00:00 직후.
-- 모든 질문은 `scheduled` 상태로 삽입. 상태 전환은 Cron(Phase 4 T-056 이후).
--
-- 재실행 대비: 각 UUID 가 고정이라 ON CONFLICT 로 idempotent 하게 처리.
-- =====================================================================

begin;

\if :{?start_date}
\else
  \echo 'ERROR: -v start_date=YYYY-MM-DD 를 지정하세요.'
  \quit
\endif

-- ---------------------------------------------------------------------
-- Day 1 — habits — 신발
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000001-0000-4000-8000-000000000001', date :'start_date' + 0, 'habits', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000001-0000-4000-8000-000000000001', 'en', 'Do you wear shoes inside your house?'),
  ('40000001-0000-4000-8000-000000000001', 'ko', '집에 들어갈 때 신발을 신은 채로 들어가나요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000001-0001-4000-8000-000000000001', '40000001-0000-4000-8000-000000000001', 1),
  ('40000001-0002-4000-8000-000000000001', '40000001-0000-4000-8000-000000000001', 2),
  ('40000001-0003-4000-8000-000000000001', '40000001-0000-4000-8000-000000000001', 3)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000001-0001-4000-8000-000000000001', 'en', 'Yes, always'),
  ('40000001-0001-4000-8000-000000000001', 'ko', '항상 신고 들어감'),
  ('40000001-0002-4000-8000-000000000001', 'en', 'Only sometimes'),
  ('40000001-0002-4000-8000-000000000001', 'ko', '가끔 신고 들어감'),
  ('40000001-0003-4000-8000-000000000001', 'en', 'No, never'),
  ('40000001-0003-4000-8000-000000000001', 'ko', '절대 신고 들어가지 않음')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 2 — habits — 양치 물
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000002-0000-4000-8000-000000000002', date :'start_date' + 1, 'habits', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000002-0000-4000-8000-000000000002', 'en', 'Do you leave the water running while brushing your teeth?'),
  ('40000002-0000-4000-8000-000000000002', 'ko', '양치할 때 물을 계속 틀어두나요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000002-0001-4000-8000-000000000002', '40000002-0000-4000-8000-000000000002', 1),
  ('40000002-0002-4000-8000-000000000002', '40000002-0000-4000-8000-000000000002', 2)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000002-0001-4000-8000-000000000002', 'en', 'Yes'),
  ('40000002-0001-4000-8000-000000000002', 'ko', '네'),
  ('40000002-0002-4000-8000-000000000002', 'en', 'No'),
  ('40000002-0002-4000-8000-000000000002', 'ko', '아니요')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 3 — food — 파인애플 피자
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000003-0000-4000-8000-000000000003', date :'start_date' + 2, 'food', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000003-0000-4000-8000-000000000003', 'en', 'How do you feel about pineapple on pizza?'),
  ('40000003-0000-4000-8000-000000000003', 'ko', '파인애플 피자, 어떻게 생각해요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000003-0001-4000-8000-000000000003', '40000003-0000-4000-8000-000000000003', 1),
  ('40000003-0002-4000-8000-000000000003', '40000003-0000-4000-8000-000000000003', 2),
  ('40000003-0003-4000-8000-000000000003', '40000003-0000-4000-8000-000000000003', 3)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000003-0001-4000-8000-000000000003', 'en', 'Love it'),
  ('40000003-0001-4000-8000-000000000003', 'ko', '완전 좋아함'),
  ('40000003-0002-4000-8000-000000000003', 'en', 'Hate it'),
  ('40000003-0002-4000-8000-000000000003', 'ko', '완전 싫어함'),
  ('40000003-0003-4000-8000-000000000003', 'en', 'Don''t care'),
  ('40000003-0003-4000-8000-000000000003', 'ko', '상관없음')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 4 — home — 두루마리 휴지 방향
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000004-0000-4000-8000-000000000004', date :'start_date' + 3, 'home', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000004-0000-4000-8000-000000000004', 'en', 'Which way do you hang your toilet paper?'),
  ('40000004-0000-4000-8000-000000000004', 'ko', '두루마리 휴지, 어떻게 거나요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000004-0001-4000-8000-000000000004', '40000004-0000-4000-8000-000000000004', 1),
  ('40000004-0002-4000-8000-000000000004', '40000004-0000-4000-8000-000000000004', 2)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000004-0001-4000-8000-000000000004', 'en', 'Over'),
  ('40000004-0001-4000-8000-000000000004', 'ko', '앞으로 (over)'),
  ('40000004-0002-4000-8000-000000000004', 'en', 'Under'),
  ('40000004-0002-4000-8000-000000000004', 'ko', '뒤로 (under)')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 5 — habits — 침대 정리
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000005-0000-4000-8000-000000000005', date :'start_date' + 4, 'habits', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000005-0000-4000-8000-000000000005', 'en', 'Do you make your bed every morning?'),
  ('40000005-0000-4000-8000-000000000005', 'ko', '아침마다 침대 정리하나요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000005-0001-4000-8000-000000000005', '40000005-0000-4000-8000-000000000005', 1),
  ('40000005-0002-4000-8000-000000000005', '40000005-0000-4000-8000-000000000005', 2),
  ('40000005-0003-4000-8000-000000000005', '40000005-0000-4000-8000-000000000005', 3)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000005-0001-4000-8000-000000000005', 'en', 'Yes, always'),
  ('40000005-0001-4000-8000-000000000005', 'ko', '항상'),
  ('40000005-0002-4000-8000-000000000005', 'en', 'Sometimes'),
  ('40000005-0002-4000-8000-000000000005', 'ko', '가끔'),
  ('40000005-0003-4000-8000-000000000005', 'en', 'Never'),
  ('40000005-0003-4000-8000-000000000005', 'ko', '안 함')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 6 — food — 물 온도
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000006-0000-4000-8000-000000000006', date :'start_date' + 5, 'food', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000006-0000-4000-8000-000000000006', 'en', 'What temperature is your water when you drink it?'),
  ('40000006-0000-4000-8000-000000000006', 'ko', '평소에 마시는 물 온도는?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000006-0001-4000-8000-000000000006', '40000006-0000-4000-8000-000000000006', 1),
  ('40000006-0002-4000-8000-000000000006', '40000006-0000-4000-8000-000000000006', 2),
  ('40000006-0003-4000-8000-000000000006', '40000006-0000-4000-8000-000000000006', 3),
  ('40000006-0004-4000-8000-000000000006', '40000006-0000-4000-8000-000000000006', 4)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000006-0001-4000-8000-000000000006', 'en', 'Cold with ice'),
  ('40000006-0001-4000-8000-000000000006', 'ko', '얼음 넣은 차가운 물'),
  ('40000006-0002-4000-8000-000000000006', 'en', 'Cold, no ice'),
  ('40000006-0002-4000-8000-000000000006', 'ko', '그냥 차가운 물'),
  ('40000006-0003-4000-8000-000000000006', 'en', 'Room temperature'),
  ('40000006-0003-4000-8000-000000000006', 'ko', '상온'),
  ('40000006-0004-4000-8000-000000000006', 'en', 'Warm or hot'),
  ('40000006-0004-4000-8000-000000000006', 'ko', '미지근 / 따뜻한 물')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 7 — tech — 알림
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000007-0000-4000-8000-000000000007', date :'start_date' + 6, 'tech', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000007-0000-4000-8000-000000000007', 'en', 'Do you read notifications as they come in, or batch them later?'),
  ('40000007-0000-4000-8000-000000000007', 'ko', '알림을 볼 때?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000007-0001-4000-8000-000000000007', '40000007-0000-4000-8000-000000000007', 1),
  ('40000007-0002-4000-8000-000000000007', '40000007-0000-4000-8000-000000000007', 2),
  ('40000007-0003-4000-8000-000000000007', '40000007-0000-4000-8000-000000000007', 3)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000007-0001-4000-8000-000000000007', 'en', 'As they come'),
  ('40000007-0001-4000-8000-000000000007', 'ko', '올 때마다 바로 확인'),
  ('40000007-0002-4000-8000-000000000007', 'en', 'Batch later'),
  ('40000007-0002-4000-8000-000000000007', 'ko', '모아서 나중에'),
  ('40000007-0003-4000-8000-000000000007', 'en', 'Notifications off'),
  ('40000007-0003-4000-8000-000000000007', 'ko', '알림 끄고 있음')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 8 — social — 친구 늦음
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000008-0000-4000-8000-000000000008', date :'start_date' + 7, 'social', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000008-0000-4000-8000-000000000008', 'en', 'If a friend is late without notice, how late is too late?'),
  ('40000008-0000-4000-8000-000000000008', 'ko', '친구가 약속에 연락 없이 늦을 때, 몇 분까지 기다릴 수 있나요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000008-0001-4000-8000-000000000008', '40000008-0000-4000-8000-000000000008', 1),
  ('40000008-0002-4000-8000-000000000008', '40000008-0000-4000-8000-000000000008', 2),
  ('40000008-0003-4000-8000-000000000008', '40000008-0000-4000-8000-000000000008', 3),
  ('40000008-0004-4000-8000-000000000008', '40000008-0000-4000-8000-000000000008', 4)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000008-0001-4000-8000-000000000008', 'en', '5 minutes'),
  ('40000008-0001-4000-8000-000000000008', 'ko', '5분'),
  ('40000008-0002-4000-8000-000000000008', 'en', '15 minutes'),
  ('40000008-0002-4000-8000-000000000008', 'ko', '15분'),
  ('40000008-0003-4000-8000-000000000008', 'en', '30 minutes'),
  ('40000008-0003-4000-8000-000000000008', 'ko', '30분'),
  ('40000008-0004-4000-8000-000000000008', 'en', '1 hour or more'),
  ('40000008-0004-4000-8000-000000000008', 'ko', '1시간 이상')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 9 — habits — 하루의 끝
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000009-0000-4000-8000-000000000009', date :'start_date' + 8, 'habits', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000009-0000-4000-8000-000000000009', 'en', 'When does your day feel like it officially ends?'),
  ('40000009-0000-4000-8000-000000000009', 'ko', '하루가 "끝났다"고 느끼는 순간은?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000009-0001-4000-8000-000000000009', '40000009-0000-4000-8000-000000000009', 1),
  ('40000009-0002-4000-8000-000000000009', '40000009-0000-4000-8000-000000000009', 2),
  ('40000009-0003-4000-8000-000000000009', '40000009-0000-4000-8000-000000000009', 3),
  ('40000009-0004-4000-8000-000000000009', '40000009-0000-4000-8000-000000000009', 4)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000009-0001-4000-8000-000000000009', 'en', 'When I leave work'),
  ('40000009-0001-4000-8000-000000000009', 'ko', '퇴근할 때'),
  ('40000009-0002-4000-8000-000000000009', 'en', 'When I eat dinner'),
  ('40000009-0002-4000-8000-000000000009', 'ko', '저녁 먹을 때'),
  ('40000009-0003-4000-8000-000000000009', 'en', 'When I brush my teeth'),
  ('40000009-0003-4000-8000-000000000009', 'ko', '양치할 때'),
  ('40000009-0004-4000-8000-000000000009', 'en', 'When I fall asleep'),
  ('40000009-0004-4000-8000-000000000009', 'ko', '잠들 때')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 10 — food — 아침 식사
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000010-0000-4000-8000-000000000010', date :'start_date' + 9, 'food', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000010-0000-4000-8000-000000000010', 'en', 'Do you eat breakfast?'),
  ('40000010-0000-4000-8000-000000000010', 'ko', '아침 식사, 얼마나 자주 해요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000010-0001-4000-8000-000000000010', '40000010-0000-4000-8000-000000000010', 1),
  ('40000010-0002-4000-8000-000000000010', '40000010-0000-4000-8000-000000000010', 2),
  ('40000010-0003-4000-8000-000000000010', '40000010-0000-4000-8000-000000000010', 3),
  ('40000010-0004-4000-8000-000000000010', '40000010-0000-4000-8000-000000000010', 4)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000010-0001-4000-8000-000000000010', 'en', 'Every day'),
  ('40000010-0001-4000-8000-000000000010', 'ko', '매일'),
  ('40000010-0002-4000-8000-000000000010', 'en', 'A few times a week'),
  ('40000010-0002-4000-8000-000000000010', 'ko', '주 몇 번'),
  ('40000010-0003-4000-8000-000000000010', 'en', 'Rarely'),
  ('40000010-0003-4000-8000-000000000010', 'ko', '거의 안 함'),
  ('40000010-0004-4000-8000-000000000010', 'en', 'Never'),
  ('40000010-0004-4000-8000-000000000010', 'ko', '안 함')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 11 — culture — 선물 열어보기
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000011-0000-4000-8000-000000000011', date :'start_date' + 10, 'culture', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000011-0000-4000-8000-000000000011', 'en', 'When you get a gift, do you open it in front of the giver?'),
  ('40000011-0000-4000-8000-000000000011', 'ko', '선물 받으면, 준 사람 앞에서 바로 열어보나요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000011-0001-4000-8000-000000000011', '40000011-0000-4000-8000-000000000011', 1),
  ('40000011-0002-4000-8000-000000000011', '40000011-0000-4000-8000-000000000011', 2),
  ('40000011-0003-4000-8000-000000000011', '40000011-0000-4000-8000-000000000011', 3)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000011-0001-4000-8000-000000000011', 'en', 'Yes, always'),
  ('40000011-0001-4000-8000-000000000011', 'ko', '네, 바로'),
  ('40000011-0002-4000-8000-000000000011', 'en', 'Only if they insist'),
  ('40000011-0002-4000-8000-000000000011', 'ko', '열어보라고 하면'),
  ('40000011-0003-4000-8000-000000000011', 'en', 'No, I wait'),
  ('40000011-0003-4000-8000-000000000011', 'ko', '안 열어봄')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 12 — home — 빨래 색 분리
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000012-0000-4000-8000-000000000012', date :'start_date' + 11, 'home', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000012-0000-4000-8000-000000000012', 'en', 'Do you separate your laundry by color?'),
  ('40000012-0000-4000-8000-000000000012', 'ko', '빨래할 때 색깔 분리하나요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000012-0001-4000-8000-000000000012', '40000012-0000-4000-8000-000000000012', 1),
  ('40000012-0002-4000-8000-000000000012', '40000012-0000-4000-8000-000000000012', 2),
  ('40000012-0003-4000-8000-000000000012', '40000012-0000-4000-8000-000000000012', 3)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000012-0001-4000-8000-000000000012', 'en', 'Yes, strictly'),
  ('40000012-0001-4000-8000-000000000012', 'ko', '철저히 분리'),
  ('40000012-0002-4000-8000-000000000012', 'en', 'Sometimes'),
  ('40000012-0002-4000-8000-000000000012', 'ko', '가끔'),
  ('40000012-0003-4000-8000-000000000012', 'en', 'No, all together'),
  ('40000012-0003-4000-8000-000000000012', 'ko', '다 같이')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 13 — habits — 청바지 세탁
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000013-0000-4000-8000-000000000013', date :'start_date' + 12, 'habits', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000013-0000-4000-8000-000000000013', 'en', 'How often do you wash your jeans?'),
  ('40000013-0000-4000-8000-000000000013', 'ko', '청바지, 얼마나 자주 빨아요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000013-0001-4000-8000-000000000013', '40000013-0000-4000-8000-000000000013', 1),
  ('40000013-0002-4000-8000-000000000013', '40000013-0000-4000-8000-000000000013', 2),
  ('40000013-0003-4000-8000-000000000013', '40000013-0000-4000-8000-000000000013', 3),
  ('40000013-0004-4000-8000-000000000013', '40000013-0000-4000-8000-000000000013', 4)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000013-0001-4000-8000-000000000013', 'en', 'After every wear'),
  ('40000013-0001-4000-8000-000000000013', 'ko', '한 번 입을 때마다'),
  ('40000013-0002-4000-8000-000000000013', 'en', 'Every few wears'),
  ('40000013-0002-4000-8000-000000000013', 'ko', '몇 번 입고'),
  ('40000013-0003-4000-8000-000000000013', 'en', 'Once a month'),
  ('40000013-0003-4000-8000-000000000013', 'ko', '한 달에 한 번'),
  ('40000013-0004-4000-8000-000000000013', 'en', 'Rarely'),
  ('40000013-0004-4000-8000-000000000013', 'ko', '거의 안 빨음')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 14 — values — 30분 일찍 vs 10분 늦게
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000014-0000-4000-8000-000000000014', date :'start_date' + 13, 'values', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000014-0000-4000-8000-000000000014', 'en', 'Would you rather be 30 minutes early or 10 minutes late?'),
  ('40000014-0000-4000-8000-000000000014', 'ko', '30분 일찍 도착 vs 10분 늦게 도착, 뭐가 나아요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000014-0001-4000-8000-000000000014', '40000014-0000-4000-8000-000000000014', 1),
  ('40000014-0002-4000-8000-000000000014', '40000014-0000-4000-8000-000000000014', 2)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000014-0001-4000-8000-000000000014', 'en', 'Early'),
  ('40000014-0001-4000-8000-000000000014', 'ko', '일찍'),
  ('40000014-0002-4000-8000-000000000014', 'en', 'Late'),
  ('40000014-0002-4000-8000-000000000014', 'ko', '늦게')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 15 — tech — 연락처 저장
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000015-0000-4000-8000-000000000015', date :'start_date' + 14, 'tech', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000015-0000-4000-8000-000000000015', 'en', 'Do you save your phone contacts by first name or last name?'),
  ('40000015-0000-4000-8000-000000000015', 'ko', '전화번호부에 연락처 저장할 때?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000015-0001-4000-8000-000000000015', '40000015-0000-4000-8000-000000000015', 1),
  ('40000015-0002-4000-8000-000000000015', '40000015-0000-4000-8000-000000000015', 2),
  ('40000015-0003-4000-8000-000000000015', '40000015-0000-4000-8000-000000000015', 3)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000015-0001-4000-8000-000000000015', 'en', 'First name'),
  ('40000015-0001-4000-8000-000000000015', 'ko', '이름 (first name)'),
  ('40000015-0002-4000-8000-000000000015', 'en', 'Last name'),
  ('40000015-0002-4000-8000-000000000015', 'ko', '성 (last name)'),
  ('40000015-0003-4000-8000-000000000015', 'en', 'Full name or mixed'),
  ('40000015-0003-4000-8000-000000000015', 'ko', '풀네임 또는 혼용')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 16 — food — 친구와 계산
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000016-0000-4000-8000-000000000016', date :'start_date' + 15, 'food', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000016-0000-4000-8000-000000000016', 'en', 'When you share a bill with friends, how do you split it?'),
  ('40000016-0000-4000-8000-000000000016', 'ko', '친구와 식사 후 계산, 어떻게 해요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000016-0001-4000-8000-000000000016', '40000016-0000-4000-8000-000000000016', 1),
  ('40000016-0002-4000-8000-000000000016', '40000016-0000-4000-8000-000000000016', 2),
  ('40000016-0003-4000-8000-000000000016', '40000016-0000-4000-8000-000000000016', 3)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000016-0001-4000-8000-000000000016', 'en', 'Evenly'),
  ('40000016-0001-4000-8000-000000000016', 'ko', '똑같이 나눔'),
  ('40000016-0002-4000-8000-000000000016', 'en', 'Each pays for their own'),
  ('40000016-0002-4000-8000-000000000016', 'ko', '각자 먹은 것만'),
  ('40000016-0003-4000-8000-000000000016', 'en', 'One pays and is repaid'),
  ('40000016-0003-4000-8000-000000000016', 'ko', '한 명이 내고 나중에 송금')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 17 — habits — 샤워 시간대
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000017-0000-4000-8000-000000000017', date :'start_date' + 16, 'habits', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000017-0000-4000-8000-000000000017', 'en', 'Do you shower in the morning or at night?'),
  ('40000017-0000-4000-8000-000000000017', 'ko', '샤워는 주로 언제?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000017-0001-4000-8000-000000000017', '40000017-0000-4000-8000-000000000017', 1),
  ('40000017-0002-4000-8000-000000000017', '40000017-0000-4000-8000-000000000017', 2),
  ('40000017-0003-4000-8000-000000000017', '40000017-0000-4000-8000-000000000017', 3),
  ('40000017-0004-4000-8000-000000000017', '40000017-0000-4000-8000-000000000017', 4)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000017-0001-4000-8000-000000000017', 'en', 'Morning'),
  ('40000017-0001-4000-8000-000000000017', 'ko', '아침'),
  ('40000017-0002-4000-8000-000000000017', 'en', 'Night'),
  ('40000017-0002-4000-8000-000000000017', 'ko', '저녁/밤'),
  ('40000017-0003-4000-8000-000000000017', 'en', 'Both'),
  ('40000017-0003-4000-8000-000000000017', 'ko', '둘 다'),
  ('40000017-0004-4000-8000-000000000017', 'en', 'Neither'),
  ('40000017-0004-4000-8000-000000000017', 'ko', '거의 안 함')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 18 — culture — 식당 신발
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000018-0000-4000-8000-000000000018', date :'start_date' + 17, 'culture', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000018-0000-4000-8000-000000000018', 'en', 'In your country, do you take shoes off at restaurants?'),
  ('40000018-0000-4000-8000-000000000018', 'ko', '식당에서 신발 벗는 경우 있나요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000018-0001-4000-8000-000000000018', '40000018-0000-4000-8000-000000000018', 1),
  ('40000018-0002-4000-8000-000000000018', '40000018-0000-4000-8000-000000000018', 2),
  ('40000018-0003-4000-8000-000000000018', '40000018-0000-4000-8000-000000000018', 3)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000018-0001-4000-8000-000000000018', 'en', 'Always'),
  ('40000018-0001-4000-8000-000000000018', 'ko', '자주'),
  ('40000018-0002-4000-8000-000000000018', 'en', 'Sometimes'),
  ('40000018-0002-4000-8000-000000000018', 'ko', '가끔'),
  ('40000018-0003-4000-8000-000000000018', 'en', 'Never'),
  ('40000018-0003-4000-8000-000000000018', 'ko', '없음')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 19 — fun — 고수 맛
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000019-0000-4000-8000-000000000019', date :'start_date' + 18, 'fun', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000019-0000-4000-8000-000000000019', 'en', 'Cilantro tastes like...?'),
  ('40000019-0000-4000-8000-000000000019', 'ko', '고수(cilantro) 맛은?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000019-0001-4000-8000-000000000019', '40000019-0000-4000-8000-000000000019', 1),
  ('40000019-0002-4000-8000-000000000019', '40000019-0000-4000-8000-000000000019', 2),
  ('40000019-0003-4000-8000-000000000019', '40000019-0000-4000-8000-000000000019', 3)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000019-0001-4000-8000-000000000019', 'en', 'Delicious'),
  ('40000019-0001-4000-8000-000000000019', 'ko', '맛있음'),
  ('40000019-0002-4000-8000-000000000019', 'en', 'Like soap'),
  ('40000019-0002-4000-8000-000000000019', 'ko', '비누 맛'),
  ('40000019-0003-4000-8000-000000000019', 'en', 'Neutral'),
  ('40000019-0003-4000-8000-000000000019', 'ko', '그냥 그럼')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 20 — home — 방문 열고 자기
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000020-0000-4000-8000-000000000020', date :'start_date' + 19, 'home', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000020-0000-4000-8000-000000000020', 'en', 'Do you keep your bedroom door open or closed while sleeping?'),
  ('40000020-0000-4000-8000-000000000020', 'ko', '잘 때 방문, 어떻게 해놔요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000020-0001-4000-8000-000000000020', '40000020-0000-4000-8000-000000000020', 1),
  ('40000020-0002-4000-8000-000000000020', '40000020-0000-4000-8000-000000000020', 2),
  ('40000020-0003-4000-8000-000000000020', '40000020-0000-4000-8000-000000000020', 3)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000020-0001-4000-8000-000000000020', 'en', 'Open'),
  ('40000020-0001-4000-8000-000000000020', 'ko', '열어놓음'),
  ('40000020-0002-4000-8000-000000000020', 'en', 'Closed'),
  ('40000020-0002-4000-8000-000000000020', 'ko', '닫아놓음'),
  ('40000020-0003-4000-8000-000000000020', 'en', 'Depends'),
  ('40000020-0003-4000-8000-000000000020', 'ko', '상황에 따라')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 21 — tech — 다크/라이트 모드
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000021-0000-4000-8000-000000000021', date :'start_date' + 20, 'tech', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000021-0000-4000-8000-000000000021', 'en', 'Do you use dark mode or light mode on your phone?'),
  ('40000021-0000-4000-8000-000000000021', 'ko', '폰은 다크모드, 라이트모드?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000021-0001-4000-8000-000000000021', '40000021-0000-4000-8000-000000000021', 1),
  ('40000021-0002-4000-8000-000000000021', '40000021-0000-4000-8000-000000000021', 2),
  ('40000021-0003-4000-8000-000000000021', '40000021-0000-4000-8000-000000000021', 3)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000021-0001-4000-8000-000000000021', 'en', 'Dark'),
  ('40000021-0001-4000-8000-000000000021', 'ko', '다크모드'),
  ('40000021-0002-4000-8000-000000000021', 'en', 'Light'),
  ('40000021-0002-4000-8000-000000000021', 'ko', '라이트모드'),
  ('40000021-0003-4000-8000-000000000021', 'en', 'Auto'),
  ('40000021-0003-4000-8000-000000000021', 'ko', '자동')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 22 — work — 이메일 답장 속도
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000022-0000-4000-8000-000000000022', date :'start_date' + 21, 'work', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000022-0000-4000-8000-000000000022', 'en', 'When you receive an email, how quickly do you usually reply?'),
  ('40000022-0000-4000-8000-000000000022', 'ko', '이메일 받으면 보통 얼마나 빨리 답장?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000022-0001-4000-8000-000000000022', '40000022-0000-4000-8000-000000000022', 1),
  ('40000022-0002-4000-8000-000000000022', '40000022-0000-4000-8000-000000000022', 2),
  ('40000022-0003-4000-8000-000000000022', '40000022-0000-4000-8000-000000000022', 3),
  ('40000022-0004-4000-8000-000000000022', '40000022-0000-4000-8000-000000000022', 4)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000022-0001-4000-8000-000000000022', 'en', 'Within an hour'),
  ('40000022-0001-4000-8000-000000000022', 'ko', '1시간 내'),
  ('40000022-0002-4000-8000-000000000022', 'en', 'Same day'),
  ('40000022-0002-4000-8000-000000000022', 'ko', '당일 내'),
  ('40000022-0003-4000-8000-000000000022', 'en', 'Within a few days'),
  ('40000022-0003-4000-8000-000000000022', 'ko', '며칠 내'),
  ('40000022-0004-4000-8000-000000000022', 'en', 'When I remember'),
  ('40000022-0004-4000-8000-000000000022', 'ko', '기억날 때')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 23 — social — 문자 vs 전화
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000023-0000-4000-8000-000000000023', date :'start_date' + 22, 'social', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000023-0000-4000-8000-000000000023', 'en', 'Do you prefer texting or calling?'),
  ('40000023-0000-4000-8000-000000000023', 'ko', '문자/전화/영상통화 중 뭐가 편해요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000023-0001-4000-8000-000000000023', '40000023-0000-4000-8000-000000000023', 1),
  ('40000023-0002-4000-8000-000000000023', '40000023-0000-4000-8000-000000000023', 2),
  ('40000023-0003-4000-8000-000000000023', '40000023-0000-4000-8000-000000000023', 3)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000023-0001-4000-8000-000000000023', 'en', 'Texting'),
  ('40000023-0001-4000-8000-000000000023', 'ko', '문자'),
  ('40000023-0002-4000-8000-000000000023', 'en', 'Calling'),
  ('40000023-0002-4000-8000-000000000023', 'ko', '전화'),
  ('40000023-0003-4000-8000-000000000023', 'en', 'Video call'),
  ('40000023-0003-4000-8000-000000000023', 'ko', '영상통화')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 24 — food — 밥 도구
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000024-0000-4000-8000-000000000024', date :'start_date' + 23, 'food', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000024-0000-4000-8000-000000000024', 'en', 'Do you eat rice with chopsticks, a fork, or a spoon?'),
  ('40000024-0000-4000-8000-000000000024', 'ko', '밥 먹을 때 뭐 쓰나요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000024-0001-4000-8000-000000000024', '40000024-0000-4000-8000-000000000024', 1),
  ('40000024-0002-4000-8000-000000000024', '40000024-0000-4000-8000-000000000024', 2),
  ('40000024-0003-4000-8000-000000000024', '40000024-0000-4000-8000-000000000024', 3)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000024-0001-4000-8000-000000000024', 'en', 'Chopsticks'),
  ('40000024-0001-4000-8000-000000000024', 'ko', '젓가락'),
  ('40000024-0002-4000-8000-000000000024', 'en', 'Fork'),
  ('40000024-0002-4000-8000-000000000024', 'ko', '포크'),
  ('40000024-0003-4000-8000-000000000024', 'en', 'Spoon'),
  ('40000024-0003-4000-8000-000000000024', 'ko', '숟가락')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 25 — habits — 양말 신고 자기
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000025-0000-4000-8000-000000000025', date :'start_date' + 24, 'habits', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000025-0000-4000-8000-000000000025', 'en', 'Do you sleep with socks on?'),
  ('40000025-0000-4000-8000-000000000025', 'ko', '잘 때 양말 신어요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000025-0001-4000-8000-000000000025', '40000025-0000-4000-8000-000000000025', 1),
  ('40000025-0002-4000-8000-000000000025', '40000025-0000-4000-8000-000000000025', 2),
  ('40000025-0003-4000-8000-000000000025', '40000025-0000-4000-8000-000000000025', 3)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000025-0001-4000-8000-000000000025', 'en', 'Always'),
  ('40000025-0001-4000-8000-000000000025', 'ko', '항상'),
  ('40000025-0002-4000-8000-000000000025', 'en', 'Sometimes'),
  ('40000025-0002-4000-8000-000000000025', 'ko', '가끔'),
  ('40000025-0003-4000-8000-000000000025', 'en', 'Never'),
  ('40000025-0003-4000-8000-000000000025', 'ko', '절대 안 신음')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 26 — travel — 여행 계획 스타일
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000026-0000-4000-8000-000000000026', date :'start_date' + 25, 'travel', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000026-0000-4000-8000-000000000026', 'en', 'When you travel, do you plan every day or go with the flow?'),
  ('40000026-0000-4000-8000-000000000026', 'ko', '여행 갈 때 계획 스타일?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000026-0001-4000-8000-000000000026', '40000026-0000-4000-8000-000000000026', 1),
  ('40000026-0002-4000-8000-000000000026', '40000026-0000-4000-8000-000000000026', 2),
  ('40000026-0003-4000-8000-000000000026', '40000026-0000-4000-8000-000000000026', 3)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000026-0001-4000-8000-000000000026', 'en', 'Detailed plan'),
  ('40000026-0001-4000-8000-000000000026', 'ko', '세세히 계획'),
  ('40000026-0002-4000-8000-000000000026', 'en', 'Rough outline'),
  ('40000026-0002-4000-8000-000000000026', 'ko', '대충 동선만'),
  ('40000026-0003-4000-8000-000000000026', 'en', 'Go with the flow'),
  ('40000026-0003-4000-8000-000000000026', 'ko', '즉흥적으로')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 27 — values — 죽는 날짜 알기
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000027-0000-4000-8000-000000000027', date :'start_date' + 26, 'values', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000027-0000-4000-8000-000000000027', 'en', 'Would you rather know the exact date of your death or not?'),
  ('40000027-0000-4000-8000-000000000027', 'ko', '내가 죽는 날짜를 정확히 알 수 있다면?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000027-0001-4000-8000-000000000027', '40000027-0000-4000-8000-000000000027', 1),
  ('40000027-0002-4000-8000-000000000027', '40000027-0000-4000-8000-000000000027', 2)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000027-0001-4000-8000-000000000027', 'en', 'Know'),
  ('40000027-0001-4000-8000-000000000027', 'ko', '알고 싶음'),
  ('40000027-0002-4000-8000-000000000027', 'en', 'Do not know'),
  ('40000027-0002-4000-8000-000000000027', 'ko', '알고 싶지 않음')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 28 — culture — 면 후루룩
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000028-0000-4000-8000-000000000028', date :'start_date' + 27, 'culture', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000028-0000-4000-8000-000000000028', 'en', 'When eating noodles, is slurping OK?'),
  ('40000028-0000-4000-8000-000000000028', 'ko', '면 먹을 때 후루룩 소리, 어때요?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000028-0001-4000-8000-000000000028', '40000028-0000-4000-8000-000000000028', 1),
  ('40000028-0002-4000-8000-000000000028', '40000028-0000-4000-8000-000000000028', 2),
  ('40000028-0003-4000-8000-000000000028', '40000028-0000-4000-8000-000000000028', 3)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000028-0001-4000-8000-000000000028', 'en', 'Totally fine'),
  ('40000028-0001-4000-8000-000000000028', 'ko', '괜찮음'),
  ('40000028-0002-4000-8000-000000000028', 'en', 'Depends on context'),
  ('40000028-0002-4000-8000-000000000028', 'ko', '상황 따라'),
  ('40000028-0003-4000-8000-000000000028', 'en', 'No, it is rude'),
  ('40000028-0003-4000-8000-000000000028', 'ko', '예의 없어 보임')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 29 — home — 식사 위치
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000029-0000-4000-8000-000000000029', date :'start_date' + 28, 'home', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000029-0000-4000-8000-000000000029', 'en', 'Do you eat at a dining table or somewhere else?'),
  ('40000029-0000-4000-8000-000000000029', 'ko', '집에서 식사는 주로 어디서?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000029-0001-4000-8000-000000000029', '40000029-0000-4000-8000-000000000029', 1),
  ('40000029-0002-4000-8000-000000000029', '40000029-0000-4000-8000-000000000029', 2),
  ('40000029-0003-4000-8000-000000000029', '40000029-0000-4000-8000-000000000029', 3),
  ('40000029-0004-4000-8000-000000000029', '40000029-0000-4000-8000-000000000029', 4)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000029-0001-4000-8000-000000000029', 'en', 'Dining table'),
  ('40000029-0001-4000-8000-000000000029', 'ko', '식탁'),
  ('40000029-0002-4000-8000-000000000029', 'en', 'Couch or in front of TV'),
  ('40000029-0002-4000-8000-000000000029', 'ko', '소파/TV 앞'),
  ('40000029-0003-4000-8000-000000000029', 'en', 'Desk or workstation'),
  ('40000029-0003-4000-8000-000000000029', 'ko', '책상 앞'),
  ('40000029-0004-4000-8000-000000000029', 'en', 'On the floor'),
  ('40000029-0004-4000-8000-000000000029', 'ko', '바닥에 앉아서')
on conflict (option_id, locale) do update set text = excluded.text;

-- ---------------------------------------------------------------------
-- Day 30 — fun — 비행 vs 투명인간
-- ---------------------------------------------------------------------
insert into questions (id, publish_date, category, status) values
  ('40000030-0000-4000-8000-000000000030', date :'start_date' + 29, 'fun', 'scheduled')
on conflict (id) do nothing;

insert into question_translations (question_id, locale, text) values
  ('40000030-0000-4000-8000-000000000030', 'en', 'If you could have one superpower, would you choose flight or invisibility?'),
  ('40000030-0000-4000-8000-000000000030', 'ko', '초능력 하나 갖는다면?')
on conflict (question_id, locale) do update set text = excluded.text;

insert into options (id, question_id, sort_order) values
  ('40000030-0001-4000-8000-000000000030', '40000030-0000-4000-8000-000000000030', 1),
  ('40000030-0002-4000-8000-000000000030', '40000030-0000-4000-8000-000000000030', 2)
on conflict (id) do nothing;

insert into option_translations (option_id, locale, text) values
  ('40000030-0001-4000-8000-000000000030', 'en', 'Flight'),
  ('40000030-0001-4000-8000-000000000030', 'ko', '비행'),
  ('40000030-0002-4000-8000-000000000030', 'en', 'Invisibility'),
  ('40000030-0002-4000-8000-000000000030', 'ko', '투명인간')
on conflict (option_id, locale) do update set text = excluded.text;

commit;

\echo ''
\echo '✓ 30 questions loaded as `scheduled`, starting :start_date'
\echo '  Day 1 publishes on :start_date, Day 30 on :start_date + 29 days'
\echo '  Status transition to `live` is handled by the cron job (T-056).'
