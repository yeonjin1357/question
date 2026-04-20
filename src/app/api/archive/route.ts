import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getArchive } from "@/lib/db/queries/archive";
import { errorResponse } from "@/lib/http/errors";
import { pickLocale } from "@/lib/http/locale";
import { rateLimitFromRequest } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  locale: z
    .string()
    .regex(/^[a-zA-Z]{2}(-[a-zA-Z]{2})?$/)
    .optional(),
  cursor: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  category: z
    .string()
    .min(1)
    .max(32)
    .regex(/^[a-z_]+$/)
    .optional(),
  search: z.string().min(1).max(100).optional(),
});

export async function GET(req: NextRequest) {
  const limit = rateLimitFromRequest(req, { key: "archive", windowSeconds: 60, max: 60 });
  if (!limit.ok) {
    return errorResponse("RATE_LIMITED", "Too many requests.", undefined, {
      headers: { "retry-after": String(limit.retryAfterSeconds) },
    });
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid query.", parsed.error.issues);
  }

  const locale = parsed.data.locale
    ? pickLocale(url, null)
    : pickLocale(url, req.headers.get("accept-language"));

  const page = await getArchive({
    locale,
    cursor: parsed.data.cursor,
    limit: parsed.data.limit,
    category: parsed.data.category,
    search: parsed.data.search,
  });

  // 검색 결과는 사용자별로 다를 가능성이 적지만 키워드 조합이 다양해 공용 캐시 효율이 떨어짐.
  // 검색어 있을 때는 짧은 private 캐시만.
  const cacheControl = parsed.data.search
    ? "private, max-age=30"
    : "public, max-age=300, stale-while-revalidate=600";

  return NextResponse.json(
    { data: page },
    {
      headers: { "cache-control": cacheControl },
    },
  );
}
