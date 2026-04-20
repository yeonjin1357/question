/**
 * 매우 단순한 스팸 필터. 정규식 기반 bad word 매칭으로 90% 쓰레기만 거릅니다.
 * Phase 4+ 에서 ML 기반으로 교체 고려 (또는 Akismet 같은 서드파티).
 */
const BANNED_PATTERNS: RegExp[] = [
  /\bviagra\b/i,
  /\bcasino\b/i,
  /\bporn\b/i,
  /\bxxx\b/i,
  /\bsex\b/i,
  /\bfuck\b/i,
  /\bshit\b/i,
  /\bnigger\b/i,
  /\bkill yourself\b/i,
  /\bkys\b/i,
  /https?:\/\//i, // 링크 금지 (스팸 대부분은 링크)
  /\b\d{10,}\b/, // 긴 숫자열 (전화번호/카드번호 스팸)
];

export function isLikelySpam(text: string): boolean {
  return BANNED_PATTERNS.some((re) => re.test(text));
}
