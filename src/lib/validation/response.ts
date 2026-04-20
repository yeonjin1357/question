import { z } from "zod";

/**
 * `POST /api/responses` 바디 스키마.
 * @see docs/API.md §POST /api/responses
 */
export const submitResponseSchema = z.object({
  questionId: z.uuid(),
  optionId: z.uuid(),
});

export type SubmitResponseBody = z.infer<typeof submitResponseSchema>;
