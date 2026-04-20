/**
 * 간단한 className 병합기. falsy 값 제거 + 공백 구분.
 * clsx/tailwind-merge 같은 외부 라이브러리 필요해지면 교체.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
