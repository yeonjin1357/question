/**
 * "이 세션은 질문 X 에 답했다" 표시용 httpOnly 쿠키 이름.
 * 값은 선택한 optionId. Layer 2 중복 방어 (ADR-003).
 */
export function answeredCookieName(questionId: string): string {
  return `oqad_answered_${questionId}`;
}

export const ANSWERED_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
