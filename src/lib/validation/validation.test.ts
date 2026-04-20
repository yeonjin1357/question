import { describe, expect, it } from "vitest";

import { localeSchema, submitResponseSchema, suggestQuestionSchema } from "./index";

const UUID_A = "11111111-1111-4111-8111-111111111111";
const UUID_B = "22222222-2222-4222-8222-222222222222";

describe("localeSchema", () => {
  it.each([
    ["en", "en"],
    ["KO", "ko"],
    ["ja-JP", "ja-jp"],
    [" en ", "en"],
  ])("accepts %s → %s", (input, expected) => {
    expect(localeSchema.parse(input)).toBe(expected);
  });

  it.each(["e", "eng", "en_US", "en-US-1", "", "123"])("rejects %j", (input) => {
    expect(localeSchema.safeParse(input).success).toBe(false);
  });
});

describe("submitResponseSchema", () => {
  it("accepts two uuids", () => {
    expect(submitResponseSchema.parse({ questionId: UUID_A, optionId: UUID_B })).toEqual({
      questionId: UUID_A,
      optionId: UUID_B,
    });
  });

  it("rejects a non-uuid questionId", () => {
    expect(
      submitResponseSchema.safeParse({ questionId: "not-uuid", optionId: UUID_B }).success,
    ).toBe(false);
  });

  it("rejects an extra unknown field is allowed (default zod behavior)", () => {
    // Zod 는 기본적으로 알 수 없는 필드를 무시(stripped)합니다. 이것이 의도인지 확인.
    const result = submitResponseSchema.parse({
      questionId: UUID_A,
      optionId: UUID_B,
      extra: "ignored",
    } as never);
    expect(result).not.toHaveProperty("extra");
  });
});

describe("suggestQuestionSchema", () => {
  const valid = {
    questionText: "Do you prefer tea or coffee?",
    options: [{ text: "Tea" }, { text: "Coffee" }],
    locale: "en",
  };

  it("accepts a minimal valid suggestion", () => {
    expect(suggestQuestionSchema.parse(valid)).toMatchObject({
      questionText: "Do you prefer tea or coffee?",
      options: [{ text: "Tea" }, { text: "Coffee" }],
      locale: "en",
    });
  });

  it("rejects too few options", () => {
    expect(suggestQuestionSchema.safeParse({ ...valid, options: [{ text: "Tea" }] }).success).toBe(
      false,
    );
  });

  it("rejects too many options", () => {
    const five = Array.from({ length: 5 }, (_, i) => ({ text: `Option ${i + 1}` }));
    expect(suggestQuestionSchema.safeParse({ ...valid, options: five }).success).toBe(false);
  });

  it("rejects a question that is too short", () => {
    expect(suggestQuestionSchema.safeParse({ ...valid, questionText: "Short?" }).success).toBe(
      false,
    );
  });

  it("rejects an invalid submitter email", () => {
    expect(
      suggestQuestionSchema.safeParse({ ...valid, submitterEmail: "not-an-email" }).success,
    ).toBe(false);
  });

  it("accepts when submitterEmail is omitted", () => {
    expect(suggestQuestionSchema.parse(valid).submitterEmail).toBeUndefined();
  });
});
