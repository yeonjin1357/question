import { defineRouting } from "next-intl/routing";

/**
 * 지원 로케일 목록. DB `question_translations.locale` 과 일치하는 소문자 언어 코드.
 * 신규 언어 추가 시엔 (a) 이 목록에 추가, (b) `messages/<locale>.json` 생성,
 * (c) 주요 질문 번역 DB 삽입 순서로 진행.
 */
export const routing = defineRouting({
  locales: ["en", "ko", "ja", "es"],
  defaultLocale: "en",
  localeDetection: true,
});

export type AppLocale = (typeof routing.locales)[number];
