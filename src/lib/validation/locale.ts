import { z } from "zod";

/**
 * BCP-47 간이 형태 (`aa` 또는 `aa-BB`). 대/소문자 허용, 파싱 시 소문자로 정규화.
 * DB `question_translations.locale` 과 `next-intl` 메시지 키와 호환.
 *
 * 지원 언어 목록 자체는 `src/i18n/config.ts` 에서 관리. 이 스키마는
 * "문자열 형태"만 검증하고 미지원 locale 은 API 계층에서 'en' 폴백.
 */
export const localeSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z]{2}(-[a-zA-Z]{2})?$/, "Locale must be 'xx' or 'xx-YY'")
  .transform((s) => s.toLowerCase());

export type Locale = z.infer<typeof localeSchema>;
