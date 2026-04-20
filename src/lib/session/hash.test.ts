import { describe, expect, it } from "vitest";

import { computeSessionHash, getDailySalt } from "./hash";

const D1 = new Date("2026-04-18T12:00:00Z");
const D1_LATE = new Date("2026-04-18T23:59:59Z");
const D2 = new Date("2026-04-19T00:00:00Z");

describe("getDailySalt", () => {
  it("produces the same salt anywhere within the same UTC day", () => {
    expect(getDailySalt(D1)).toBe(getDailySalt(D1_LATE));
  });

  it("produces a different salt on the next UTC day", () => {
    expect(getDailySalt(D1)).not.toBe(getDailySalt(D2));
  });

  it("embeds the UTC date as YYYYMMDD suffix", () => {
    expect(getDailySalt(D1).endsWith("|20260418")).toBe(true);
  });
});

describe("computeSessionHash", () => {
  it("returns a 64-char hex string (SHA-256)", () => {
    const hash = computeSessionHash("1.2.3.4", "Mozilla/5.0", D1);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for the same inputs within one day", () => {
    const a = computeSessionHash("1.2.3.4", "Mozilla/5.0", D1);
    const b = computeSessionHash("1.2.3.4", "Mozilla/5.0", D1_LATE);
    expect(a).toBe(b);
  });

  it("produces a different hash on the next UTC day even for identical (ip, ua)", () => {
    const a = computeSessionHash("1.2.3.4", "Mozilla/5.0", D1);
    const b = computeSessionHash("1.2.3.4", "Mozilla/5.0", D2);
    expect(a).not.toBe(b);
  });

  it("produces a different hash for a different IP", () => {
    const a = computeSessionHash("1.2.3.4", "Mozilla/5.0", D1);
    const b = computeSessionHash("5.6.7.8", "Mozilla/5.0", D1);
    expect(a).not.toBe(b);
  });

  it("produces a different hash for a different User-Agent", () => {
    const a = computeSessionHash("1.2.3.4", "Mozilla/5.0", D1);
    const b = computeSessionHash("1.2.3.4", "curl/8.0", D1);
    expect(a).not.toBe(b);
  });
});
