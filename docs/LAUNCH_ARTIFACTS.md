# 런칭 아티팩트 (T-057)

> 런칭 당일 / 직전에 복사-붙여넣기 하도록 준비한 초안 모음. 모든 문구는 사용자 검수 필수.
> 도메인 placeholder `https://onequestionaday.com` 은 실제 도메인으로 교체하세요.

---

## 1. Product Hunt

### Tagline (60자 제한)
> One question a day. The world answers on a map.

### 대체안
- One question. One day. 10 seconds. The world answers.
- A daily micro-survey for 8 billion people.

### Description (260자 제한)
> Every day at UTC 00:00, one question drops. Pick an option in 10 seconds and instantly see how the world answered — on a live world map, by country. No accounts, no ads, no tracking. 4 languages. Shareable.

### Topics
`Survey`, `Privacy`, `Social Media`, `Open Source`, `Indie`

### Maker comment (launch day)
> Hey PH 👋 I made OneQ because I was tired of infinite feeds. I wanted one thing a day — a small, weird question — and I wanted to see how the rest of the world would answer it on a map. No account, no tracking, no ads. Just a question, a click, and a colored map.
>
> Everything is built with Next.js + Supabase, open source. The first 30 questions are designed to be low-stakes and globally relatable: "Do you wear shoes inside?", "Pineapple on pizza?", etc. Plenty more to come from the `/suggest` page — that's how I want the archive to grow.
>
> Happy to answer any questions. And if you launch the site, please send me your country's result screenshot — I'd love to see which country decides pineapple is soap 🍍.

---

## 2. Show HN

### Title
> Show HN: OneQ – One question a day, answered by the world on a live map

### Body
Hi HN,

OneQ (https://onequestionaday.com) is a micro-survey site I built with the constraint of "one thing per day, no feed." Every UTC midnight it publishes exactly one question with 2–4 options. You answer in about 10 seconds and the result shows up immediately: a bar chart for the global breakdown and a world map colored by each country's top choice.

The privacy posture drove most of the design:
- No accounts. No email. No ads.
- One strictly-necessary cookie to remember your answer for the day.
- Your IP is never stored — only a SHA-256 hash salted with a value that rotates daily (so the hash can't be correlated across days).
- Country is derived from Cloudflare's `CF-IPCountry` header, which we read once and throw away.

The stack is Next.js 14 (App Router), Supabase (Postgres + RLS), Vercel + Cloudflare, next-intl for i18n (en/ko/ja/es). The world map is plain SVG via `react-simple-maps` (~40KB gzipped) — I tried `recharts` first for the bar chart but it ballooned the bundle, so I ripped it out and replaced with styled `<div>`s.

Some design calls I went back and forth on:
- **Threshold for coloring a country.** Started at 10 responses (privacy/statistical), lowered to 1 on launch day because the map felt dead with small initial traffic. Happy to hear opinions.
- **Polling vs realtime.** Went with 15s polling over Supabase Realtime because RLS blocks anon reads of `responses`, and I didn't want to open that up just for a "live counter."
- **Question seeding.** First 30 days are hand-written with en + ko translations; ja/es were added via my own translation, to be QA'd by native speakers before serious launch. After day 30, community suggestions through `/suggest` get moderated into the queue.

Things I'd love feedback on:
- Question ideas that work across cultures without being too American/loaded.
- Whether the 1-response threshold feels sketchy or fine.
- Any OSS projects like this that I missed while building — I searched but the landscape seems mostly dashboards and polls-in-Discord bots.

Happy to answer anything technical.

---

## 3. Twitter / X thread (English)

**Tweet 1** (hook, 280자)
> 🌍 Launching OneQ today.
>
> One question. One day. The whole world answers.
>
> Pick in 10 seconds, see the result on a live world map.
>
> No accounts, no ads, no tracking — just a daily mini-survey you can't doomscroll past.
>
> → onequestionaday.com

**Tweet 2** (why)
> Why? Because I wanted ONE small thing a day.
>
> Not a feed. Not a push notification. Not an infinite scroll.
>
> Just: open the page, answer, see how Korea vs. Mexico vs. Japan voted, close the tab.

**Tweet 3** (example)
> Today's question: "Do you wear shoes inside your house?"
>
> Spoiler: this one splits hard by country. 🇰🇷🇯🇵 vs. 🇺🇸🇪🇸.
>
> New question every UTC 00:00.

**Tweet 4** (stack / privacy)
> Built with Next.js + Supabase + Cloudflare.
>
> Privacy: no accounts, IPs hashed with daily-rotating salt, one strictly-necessary cookie. Open source, no ads, no analytics beyond Plausible.

**Tweet 5** (CTA)
> Try today's question → onequestionaday.com
>
> And if you have a better question, send it in: onequestionaday.com/suggest 💡
>
> Please RT if you like the idea 🙏

---

## 4. Twitter / X thread (Korean)

**Tweet 1** (hook)
> 🌍 오늘 OneQ 런칭합니다.
>
> 매일 UTC 00:00에 단 하나의 질문. 10초 안에 답하면, 전 세계 사람들의 답이 세계지도 위에 국가별로 펼쳐져요.
>
> 계정도, 광고도, 추적도 없어요. 그냥 하루에 한 질문.
>
> → onequestionaday.com

**Tweet 2** (why)
> 왜 만들었냐면 — 하루에 "딱 하나" 만 하고 싶었어요.
>
> 피드도, 알림도, 무한 스크롤도 없이.
>
> 들어가서, 답하고, 한국 vs 일본 vs 미국이 어떻게 답했는지 보고, 탭 닫기. 끝.

**Tweet 3** (example)
> 오늘의 질문: "집에 들어갈 때 신발을 신은 채로 들어가나요?"
>
> 이 질문 하나로 나라별 문화 차이가 바로 드러납니다. 🇰🇷🇯🇵 vs 🇺🇸
>
> 매일 UTC 자정에 새 질문.

**Tweet 4** (stack / privacy)
> 기술적으론 Next.js + Supabase + Cloudflare.
>
> 프라이버시: 계정 없음, IP는 매일 바뀌는 솔트로 해싱만, 쿠키는 세션용 딱 하나. 광고 없고 추적 안 해요.

**Tweet 5** (CTA)
> 오늘 질문 답해보러 → onequestionaday.com
>
> 좋은 질문 아이디어 있으면 제안도 환영: onequestionaday.com/suggest 💡
>
> 좋아하는 분은 RT 부탁드려요 🙏

---

## 5. 긱뉴스 포스트 (한국 커뮤니티)

### 제목
> OneQ - 매일 하나의 질문, 전 세계가 답하는 마이크로 설문

### 본문
안녕하세요, `onequestionaday.com` 이라는 사이트를 만들어서 공유드립니다.

**무엇인가요?**
매일 UTC 00:00 (한국 시간 오전 9시) 에 단 하나의 질문이 공개됩니다. 답은 2–4개 중 하나를 고르면 끝 (약 10초). 답하고 나면 바로 전 세계 응답을 세계지도로 국가별로 보여줍니다.

**예시 질문:**
- 집에 들어갈 때 신발 신은 채로 들어가나요?
- 파인애플 피자 어떻게 생각하세요?
- 30분 일찍 도착 vs 10분 늦게, 뭐가 나아요?

문화적 차이가 국가별로 드러나는 질문이 주를 이룹니다.

**왜 만들었는지:**
- 피드/알림/무한스크롤 없이 "하루에 하나" 만 소비하는 경험을 만들고 싶었어요
- 10초 투자로 "세계가 이 질문에 어떻게 답하고 있는지" 를 볼 수 있으면 재밌을 것 같았고
- 계정/광고/트래킹 없이 만들면 Privacy-first SNS 의 작은 예시가 될 수 있겠다 싶었습니다

**기술 스택:**
- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase (Postgres + RLS + 일일 솔트 기반 세션 해시)
- Vercel + Cloudflare (CF-IPCountry 헤더로 국가 감지)
- `react-simple-maps` + world-atlas 로 세계지도, 바 차트는 순수 Tailwind
- next-intl 로 en/ko/ja/es 4개 언어, 질문도 다국어 번역

**프라이버시 설계:**
- 계정, 이메일, 광고 쿠키 전부 없음
- IP는 저장 안 함, 매일 바뀌는 솔트로 SHA-256 해싱해서 세션 식별만
- 응답은 `(질문, 세션해시, 국가코드)` 만 저장, 개인 식별자 없음
- 쿠키는 "오늘 이 질문에 답했음" 용 하나만

관심 있으시면 한번 들어가서 답해보시고, 질문 아이디어 있으면 `/suggest` 로 제안해 주세요. 코드는 GitHub 에 공개되어 있습니다.

---

## 6. 디스콰이엇 포스트 (한국 메이커 커뮤니티)

### 제목
> 하루 한 질문, 세계지도로 답이 펼쳐지는 사이트 만들었어요 - OneQ

### 본문
아무도 요청하지 않은 사이드프로젝트를 출시했습니다 😅

**컨셉:** 매일 UTC 자정에 질문 하나. 답하면 세계지도에 국가별 선택 색깔로 펼쳐짐. 하루에 딱 한 번, 10초 참여.

**만든 이유:**
- 요즘 모든 앱이 "더 오래 머물게" 만들어지는 게 피곤해서
- 10초 열고 답하고 닫는, 그런 앱이 하나쯤 있으면 했음
- 세계지도 위에 국가별로 답이 펼쳐지는 순간이 시각적으로 재미있을 것 같았음

**현재 상태:**
- 30일치 런칭 질문 en + ko 번역 완료, ja/es 는 초벌
- 프라이버시 설계 꽤 신경썼어요 (계정 없음, IP 해싱, 광고 없음)
- 광고 없고 수익 모델 없음. 그냥 만들어봤음.

**도와주실 수 있는 것:**
1. 한번 들어가서 오늘 질문 답해주시기 (국가별 표본 늘리는 게 목표)
2. `/suggest` 에서 재밌는 질문 제안해주시기
3. 번역이 어색한 게 있으면 알려주시기

URL: https://onequestionaday.com

---

## 7. 런칭 체크리스트

### T-0 (D-day 아침)
- [ ] Vercel Production 배포 확인
- [ ] 커스텀 도메인 DNS 확인
- [ ] `NEXT_PUBLIC_APP_URL` 이 실제 도메인인지
- [ ] `/api/cron/rotate-questions` 가 UTC 00:00 에 호출되었는지 Vercel 대시보드에서 확인
- [ ] `/feed.xml`, `/sitemap.xml`, `/robots.txt` 응답 확인
- [ ] Plausible 에 트래픽 들어오는지 확인
- [ ] Sentry 연결되어 있으면 DSN 활성화 및 알림 룰 점검

### 런칭 직전 시크릿 로테이션 (ROADMAP T-056)
- [ ] Supabase 대시보드에서 anon/service_role JWT 재발급
- [ ] PAT revoke & 재생성
- [ ] Vercel env 갱신
- [ ] `SESSION_HASH_SECRET` 은 런칭 후엔 바꾸지 말 것 (이미 응답한 사용자 세션 무효화됨)

### 포스팅 순서
1. Twitter 한국어 thread (한국 아침)
2. 긱뉴스 + 디스콰이엇 (한국 오전)
3. Twitter 영어 thread (미국 아침 = 한국 저녁)
4. Show HN (미국 아침)
5. Product Hunt (미국 자정 직후 = 한국 오후)

### 첫 24시간 모니터링
- [ ] Vercel 로그 — 에러율
- [ ] Supabase — 응답 수 증가 곡선
- [ ] Plausible — 유입 채널별 전환율
- [ ] DB 용량 추이 (무료 티어 한도)
- [ ] Cron 정상 동작
