# 질문 작성 가이드라인

이 서비스의 생명은 **질문의 질**입니다. 좋은 질문 30개가 나쁜 질문 300개보다 낫습니다.

---

## 1. 좋은 질문의 조건

### ✅ 좋은 질문
- **문화 차이가 드러남** ("신발 신고 집에 들어감?")
- **누구나 30초 안에 이해** ("양치할 때 물 틀어둠?")
- **정답이 없는** 호불호/습관/가치관 ("파인애플 피자 어떻게 생각?")
- **옵션이 명확히 구분됨** (애매한 중간지대 최소화)
- **보편적 경험** (지역 지식 불필요)

### ❌ 나쁜 질문
- 정치/종교 민감 이슈 (초반엔 전부 피하기)
- 지역 지식 필요 ("김치 중 제일 좋아하는?")
- 이미 답이 정해진 것 ("살인은 나쁨?")
- 옵션이 겹치거나 모호함
- 너무 개인적 (프라이버시 침해 느낌)

### 🤔 조심할 질문
- 민감할 수 있으나 문화 차이 드러내는 좋은 질문 → 신중히 옵션 설계 (판단 여지 주기, 강요 느낌 없애기)
- 소수 의견이 "틀렸다" 느낌 들지 않게

---

## 2. 옵션 설계 규칙

- **개수: 2~4개**. 5개 이상은 피하기 (차트가 지저분해짐).
- **옵션 텍스트: 1~50자**. 짧을수록 좋음.
- **MECE에 가깝게** (상호배타, 전체망라)
- "기타" 옵션은 피하기. 대신 핵심 응답만 뽑기.
- 번역 시 길이 배가 주의 (한국어 → 독일어는 2배 늘어나기 쉬움)

---

## 3. 번역 가이드

- **의역 우선**. 직역은 재미를 죽임.
- 영어가 기본 (`en`). 여기서부터 각 언어로.
- 문화적 맥락이 맞지 않으면 해당 언어만 다른 옵션 구성 고려 (드물게)
- 번역은 원어민 또는 고품질 LLM + 검수

---

## 4. 카테고리

현재 사용하는 카테고리 태그:

- `habits` — 일상 습관 (양치, 수면, 식사)
- `food` — 음식, 맛, 식습관
- `culture` — 인사, 예절, 관습
- `values` — 가치관, 선호
- `tech` — 기술 사용 습관
- `home` — 집, 인테리어
- `travel` — 여행
- `work` — 일, 직장
- `social` — 관계, 친구
- `fun` — 가벼운 재미 (MBTI스럽지 않게)

새 카테고리 도입은 ADR 작성 권장.

---

## 5. 런칭 초기 30일 시드 질문

각 질문은 `{ publishDate, category, en: {text, options}, ko: {text, options} }` 구조입니다.

### Day 1
- **카테고리**: habits
- **EN**: Do you wear shoes inside your house?
  - Yes, always
  - Only sometimes
  - No, never
- **KO**: 집에 들어갈 때 신발을 신은 채로 들어가나요?
  - 항상 신고 들어감
  - 가끔 신고 들어감
  - 절대 신고 들어가지 않음

### Day 2
- **카테고리**: habits
- **EN**: Do you leave the water running while brushing your teeth?
  - Yes
  - No
- **KO**: 양치할 때 물을 계속 틀어두나요?
  - 네
  - 아니요

### Day 3
- **카테고리**: food
- **EN**: How do you feel about pineapple on pizza?
  - Love it
  - Hate it
  - Don't care
- **KO**: 파인애플 피자, 어떻게 생각해요?
  - 완전 좋아함
  - 완전 싫어함
  - 상관없음

### Day 4
- **카테고리**: home
- **EN**: Which way do you hang your toilet paper?
  - Over
  - Under
- **KO**: 두루마리 휴지, 어떻게 거나요?
  - 앞으로 (over)
  - 뒤로 (under)

### Day 5
- **카테고리**: habits
- **EN**: Do you make your bed every morning?
  - Yes, always
  - Sometimes
  - Never
- **KO**: 아침마다 침대 정리하나요?
  - 항상
  - 가끔
  - 안 함

### Day 6
- **카테고리**: food
- **EN**: What temperature is your water when you drink it?
  - Cold with ice
  - Cold, no ice
  - Room temperature
  - Warm/hot
- **KO**: 평소에 마시는 물 온도는?
  - 얼음 넣은 차가운 물
  - 그냥 차가운 물
  - 상온
  - 미지근 / 따뜻한 물

### Day 7
- **카테고리**: tech
- **EN**: Do you read notifications as they come in, or batch them later?
  - As they come
  - Batch later
  - Notifications off
- **KO**: 알림을 볼 때?
  - 올 때마다 바로 확인
  - 모아서 나중에
  - 알림 끄고 있음

### Day 8
- **카테고리**: social
- **EN**: If a friend is late without notice, how late is too late?
  - 5 minutes
  - 15 minutes
  - 30 minutes
  - 1 hour+
- **KO**: 친구가 약속에 연락 없이 늦을 때, 몇 분까지 기다릴 수 있나요?
  - 5분
  - 15분
  - 30분
  - 1시간 이상

### Day 9
- **카테고리**: habits
- **EN**: When does your day feel like it officially ends?
  - When I leave work
  - When I eat dinner
  - When I brush my teeth
  - When I fall asleep
- **KO**: 하루가 "끝났다"고 느끼는 순간은?
  - 퇴근할 때
  - 저녁 먹을 때
  - 양치할 때
  - 잠들 때

### Day 10
- **카테고리**: food
- **EN**: Do you eat breakfast?
  - Every day
  - A few times a week
  - Rarely
  - Never
- **KO**: 아침 식사, 얼마나 자주 해요?
  - 매일
  - 주 몇 번
  - 거의 안 함
  - 안 함

### Day 11
- **카테고리**: culture
- **EN**: When you get a gift, do you open it in front of the giver?
  - Yes, always
  - Only if they insist
  - No, I wait
- **KO**: 선물 받으면, 준 사람 앞에서 바로 열어보나요?
  - 네, 바로
  - 열어보라고 하면
  - 안 열어봄

### Day 12
- **카테고리**: home
- **EN**: Do you separate your laundry by color?
  - Yes, strictly
  - Sometimes
  - No, all together
- **KO**: 빨래할 때 색깔 분리하나요?
  - 철저히 분리
  - 가끔
  - 다 같이

### Day 13
- **카테고리**: habits
- **EN**: How often do you wash your jeans?
  - After every wear
  - Every few wears
  - Once a month
  - Rarely
- **KO**: 청바지, 얼마나 자주 빨아요?
  - 한 번 입을 때마다
  - 몇 번 입고
  - 한 달에 한 번
  - 거의 안 빨음

### Day 14
- **카테고리**: values
- **EN**: Would you rather be 30 minutes early or 10 minutes late?
  - Early
  - Late
- **KO**: 30분 일찍 도착 vs 10분 늦게 도착, 뭐가 나아요?
  - 일찍
  - 늦게

### Day 15
- **카테고리**: tech
- **EN**: Do you save your phone contacts by first name or last name?
  - First name
  - Last name
  - Full name / mixed
- **KO**: 전화번호부에 연락처 저장할 때?
  - 이름 (first name)
  - 성 (last name)
  - 풀네임 또는 혼용

### Day 16
- **카테고리**: food
- **EN**: When you share a bill with friends, how do you split it?
  - Evenly
  - Each pays for their own
  - One pays and is repaid
- **KO**: 친구와 식사 후 계산, 어떻게 해요?
  - 똑같이 나눔
  - 각자 먹은 것만
  - 한 명이 내고 나중에 송금

### Day 17
- **카테고리**: habits
- **EN**: Do you shower in the morning or at night?
  - Morning
  - Night
  - Both
  - Neither (rare)
- **KO**: 샤워는 주로 언제?
  - 아침
  - 저녁/밤
  - 둘 다
  - 거의 안 함

### Day 18
- **카테고리**: culture
- **EN**: In your country, do you take shoes off at restaurants?
  - Always
  - Sometimes
  - Never
- **KO**: 식당에서 신발 벗는 경우 있나요?
  - 자주
  - 가끔
  - 없음

### Day 19
- **카테고리**: fun
- **EN**: Cilantro tastes like...?
  - Delicious
  - Like soap
  - Neutral
- **KO**: 고수(cilantro) 맛은?
  - 맛있음
  - 비누 맛
  - 그냥 그럼

### Day 20
- **카테고리**: home
- **EN**: Do you keep your bedroom door open or closed while sleeping?
  - Open
  - Closed
  - Depends
- **KO**: 잘 때 방문, 어떻게 해놔요?
  - 열어놓음
  - 닫아놓음
  - 상황에 따라

### Day 21
- **카테고리**: tech
- **EN**: Do you use dark mode or light mode on your phone?
  - Dark
  - Light
  - Auto
- **KO**: 폰은 다크모드, 라이트모드?
  - 다크모드
  - 라이트모드
  - 자동

### Day 22
- **카테고리**: work
- **EN**: When you receive an email, how quickly do you usually reply?
  - Within an hour
  - Same day
  - Within a few days
  - When I remember
- **KO**: 이메일 받으면 보통 얼마나 빨리 답장?
  - 1시간 내
  - 당일 내
  - 며칠 내
  - 기억날 때

### Day 23
- **카테고리**: social
- **EN**: Do you prefer texting or calling?
  - Texting
  - Calling
  - Video call
- **KO**: 문자/전화/영상통화 중 뭐가 편해요?
  - 문자
  - 전화
  - 영상통화

### Day 24
- **카테고리**: food
- **EN**: Do you eat rice with chopsticks, a fork, or a spoon?
  - Chopsticks
  - Fork
  - Spoon
- **KO**: 밥 먹을 때 뭐 쓰나요?
  - 젓가락
  - 포크
  - 숟가락

### Day 25
- **카테고리**: habits
- **EN**: Do you sleep with socks on?
  - Always
  - Sometimes
  - Never
- **KO**: 잘 때 양말 신어요?
  - 항상
  - 가끔
  - 절대 안 신음

### Day 26
- **카테고리**: travel
- **EN**: When you travel, do you plan every day or go with the flow?
  - Detailed plan
  - Rough outline
  - Go with the flow
- **KO**: 여행 갈 때 계획 스타일?
  - 세세히 계획
  - 대충 동선만
  - 즉흥적으로

### Day 27
- **카테고리**: values
- **EN**: Would you rather know the exact date of your death or not?
  - Know
  - Don't know
- **KO**: 내가 죽는 날짜를 정확히 알 수 있다면?
  - 알고 싶음
  - 알고 싶지 않음

### Day 28
- **카테고리**: culture
- **EN**: When eating noodles, is slurping OK?
  - Totally fine
  - Depends on context
  - No, it's rude
- **KO**: 면 먹을 때 후루룩 소리, 어때요?
  - 괜찮음
  - 상황 따라
  - 예의 없어 보임

### Day 29
- **카테고리**: home
- **EN**: Do you eat at a dining table or somewhere else?
  - Dining table
  - Couch / TV
  - Desk / workstation
  - On the floor
- **KO**: 집에서 식사는 주로 어디서?
  - 식탁
  - 소파/TV 앞
  - 책상 앞
  - 바닥에 앉아서

### Day 30
- **카테고리**: fun
- **EN**: If you could have one superpower, would you choose flight or invisibility?
  - Flight
  - Invisibility
- **KO**: 초능력 하나 갖는다면?
  - 비행
  - 투명인간

---

## 6. 개발 시드 (`supabase/seed.sql`용)

로컬 개발 편의상, `seed.sql`은 다음 3개만 주입:

1. **어제 (archived)**: Day 1 (신발)
2. **오늘 (live)**: Day 2 (양치)
3. **내일 (scheduled)**: Day 3 (파인애플 피자)

각 질문당 `responses` 500개를 랜덤 국가/옵션 분포로 생성하는 PL/pgSQL 블록 포함.

---

## 7. 질문 큐 관리

- 관리자 페이지(Phase 2)에서 `scheduled` 상태로 날짜별 큐잉
- 매일 UTC 00:00 Cron (Vercel Cron 또는 Supabase Edge Function)이 `scheduled` → `live`, `live` → `archived` 전환
- 당일에 `scheduled`가 없으면 긴급 폴백 질문 (DB에 `is_fallback=true` 플래그 추가 고려) — TODO ADR

---

## 8. 커뮤니티 제안 승인 가이드

승인 기준:
- 위 "좋은 질문의 조건" 충족
- 기존 질문과 중복되지 않음
- 번역 가능 (고유명사, 지역 밈 등 제외)
- 옵션 2~4개, 각 50자 이내

거절 시 거절 사유를 `admin_note`에 기록. 제출자 이메일 있으면 알림.
