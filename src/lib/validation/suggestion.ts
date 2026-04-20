import { z } from "zod";

import { localeSchema } from "./locale";

/**
 * `POST /api/suggestions` 바디 스키마.
 * 길이 제약은 docs/DATABASE.md §2.7 과 일치해야 합니다.
 */
export const suggestQuestionSchema = z.object({
  questionText: z.string().trim().min(10).max(200),
  options: z
    .array(
      z.object({
        text: z.string().trim().min(1).max(50),
      }),
    )
    .min(2)
    .max(4),
  locale: localeSchema,
  submitterEmail: z.email().optional(),
});

export type SuggestQuestionBody = z.infer<typeof suggestQuestionSchema>;
