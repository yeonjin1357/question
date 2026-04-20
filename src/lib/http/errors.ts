import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "DUPLICATE_RESPONSE"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  DUPLICATE_RESPONSE: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

/**
 * docs/API.md "공통 에러 포맷" 을 따르는 JSON 에러 응답.
 */
export function errorResponse(
  code: ApiErrorCode,
  message: string,
  details?: unknown,
  init?: { headers?: HeadersInit },
): NextResponse {
  return NextResponse.json(
    { error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status: STATUS_BY_CODE[code], headers: init?.headers },
  );
}
