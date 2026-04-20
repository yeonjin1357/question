import Script from "next/script";

import { env } from "@/lib/env";

/**
 * Plausible Analytics 스크립트. Server Component 에서 렌더해 client bundle 에
 * 스크립트 태그만 심어줌. 쿠키 없이 동작하므로 별도 동의 절차 불필요.
 *
 * `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` 이 비어 있으면 (예: 로컬/개발) 아예 렌더하지 않음.
 */
export function PlausibleScript() {
  const domain = env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
