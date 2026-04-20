import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const LOCALE_SEGMENT_RE = new RegExp(`^/(${routing.locales.join("|")})(/|$)`);

function isAdminPath(pathname: string): boolean {
  if (pathname.startsWith("/api/admin")) return true;
  const m = pathname.match(LOCALE_SEGMENT_RE);
  if (!m) return false;
  const rest = pathname.slice((m[1]?.length ?? 0) + 1);
  return rest === "/admin" || rest.startsWith("/admin/");
}

function checkAdminAuth(req: NextRequest): NextResponse | null {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    return new NextResponse("Admin not configured.", { status: 503 });
  }
  const header = req.headers.get("authorization");
  if (!header?.toLowerCase().startsWith("basic ")) {
    return new NextResponse("Authentication required.", {
      status: 401,
      headers: { "www-authenticate": 'Basic realm="admin"' },
    });
  }
  try {
    const decoded = atob(header.slice(6).trim());
    const sep = decoded.indexOf(":");
    const password = sep >= 0 ? decoded.slice(sep + 1) : "";
    if (password !== token) {
      return new NextResponse("Forbidden.", { status: 403 });
    }
    return null;
  } catch {
    return new NextResponse("Bad credentials.", { status: 400 });
  }
}

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (isAdminPath(pathname)) {
    const fail = checkAdminAuth(req);
    if (fail) return fail;
    // 인증 통과 → /api/admin/* 는 그대로 핸들러로, /<locale>/admin 은 intl 경로로 계속.
    if (pathname.startsWith("/api/admin")) return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

// _next, _vercel, 파일 확장자 있는 경로는 건너뜁니다. /api 는 통과시켜 admin 인증 수행.
export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
