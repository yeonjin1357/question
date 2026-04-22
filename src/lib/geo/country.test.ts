import type { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { getCountryFromRequest, normalizeCountryCode } from "./country";

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return { headers: new Headers(headers) } as unknown as NextRequest;
}

describe("normalizeCountryCode", () => {
  it.each([
    ["KR", "KR"],
    ["us", "US"],
    [" jp ", "JP"],
    ["Gb", "GB"],
  ])("accepts %s → %s", (input, expected) => {
    expect(normalizeCountryCode(input)).toBe(expected);
  });

  it.each(["XX", "T1", "EU"])("maps special code %s to null", (input) => {
    expect(normalizeCountryCode(input)).toBeNull();
  });

  it.each([null, undefined, "", "USA", "K", "K1R", "1R", "KR1", "K-R"])(
    "rejects invalid input %j with null",
    (input) => {
      expect(normalizeCountryCode(input)).toBeNull();
    },
  );
});

describe("getCountryFromRequest (header path)", () => {
  // 테스트 환경에선 vitest.setup.ts 가 DEV_COUNTRY_OVERRIDE 를 설정하지 않으므로
  // 기본적으로 헤더 경로를 탑니다.
  it("reads cf-ipcountry header", () => {
    const req = makeRequest({ "cf-ipcountry": "JP" });
    expect(getCountryFromRequest(req)).toBe("JP");
  });

  it("falls back to x-vercel-ip-country when cf-ipcountry is absent", () => {
    const req = makeRequest({ "x-vercel-ip-country": "KR" });
    expect(getCountryFromRequest(req)).toBe("KR");
  });

  it("prefers cf-ipcountry over x-vercel-ip-country", () => {
    const req = makeRequest({ "cf-ipcountry": "US", "x-vercel-ip-country": "KR" });
    expect(getCountryFromRequest(req)).toBe("US");
  });

  it("falls through to x-vercel-ip-country when cf-ipcountry is an invalid bucket", () => {
    const req = makeRequest({ "cf-ipcountry": "XX", "x-vercel-ip-country": "KR" });
    expect(getCountryFromRequest(req)).toBe("KR");
  });

  it("returns null for missing header", () => {
    const req = makeRequest();
    expect(getCountryFromRequest(req)).toBeNull();
  });

  it("returns null for the XX (unknown) bucket", () => {
    const req = makeRequest({ "cf-ipcountry": "XX" });
    expect(getCountryFromRequest(req)).toBeNull();
  });
});
