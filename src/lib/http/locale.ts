import { localeSchema } from "@/lib/validation/locale";

/**
 * HTTP 요청에서 사용할 로케일을 결정합니다.
 * 우선순위: ?locale= 쿼리 > Accept-Language 첫 토큰 > 'en'.
 * 각 단계에서 localeSchema 로 정규화되며, 실패하면 다음 단계로 폴백.
 *
 * 주의: 지원 언어 여부는 여기서 검사하지 않습니다. DB 번역 조회 시점에
 * 폴백(`isTranslationFallback`)으로 처리합니다.
 */
export function pickLocale(url: URL, acceptLanguage: string | null): string {
  const queryLocale = url.searchParams.get("locale");
  if (queryLocale) {
    const parsed = localeSchema.safeParse(queryLocale);
    if (parsed.success) return parsed.data;
  }
  if (acceptLanguage) {
    const first = acceptLanguage.split(",")[0]?.trim().split(";")[0]?.trim();
    if (first) {
      const parsed = localeSchema.safeParse(first);
      if (parsed.success) return parsed.data;
    }
  }
  return "en";
}

/**
 * UTC 기준 다음 자정(= 다음 질문 공개 시각) 까지 남은 초.
 */
export function secondsUntilNextUtcMidnight(now: Date = new Date()): number {
  const tomorrow = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0,
    0,
  );
  return Math.max(0, Math.floor((tomorrow - now.getTime()) / 1000));
}
