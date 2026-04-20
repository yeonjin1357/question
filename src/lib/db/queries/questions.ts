import "server-only";

import { createServerSupabase } from "@/lib/db/server";

export interface TodayQuestionOption {
  id: string;
  sortOrder: number;
  text: string;
}

export interface TodayQuestion {
  question: {
    id: string;
    category: string;
    publishDate: string;
    text: string;
  };
  options: TodayQuestionOption[];
  isTranslationFallback: boolean;
}

/**
 * 요청 로케일로부터 DB 조회용 폴백 체인을 만듭니다.
 * 예) `ko-kr` → `["ko-kr", "ko", "en"]`, `ko` → `["ko", "en"]`, `en` → `["en"]`.
 */
function buildLocaleChain(requested: string): string[] {
  const chain = [requested];
  const lang = requested.split("-")[0];
  if (lang && lang !== requested) chain.push(lang);
  if (!chain.includes("en")) chain.push("en");
  return chain;
}

function pickByChain<T extends { locale: string }>(
  rows: T[] | null | undefined,
  chain: string[],
): T | null {
  if (!rows || rows.length === 0) return null;
  for (const locale of chain) {
    const found = rows.find((r) => r.locale === locale);
    if (found) return found;
  }
  return null;
}

function isSameLanguageFamily(requested: string, chosen: string): boolean {
  return requested.split("-")[0] === chosen.split("-")[0];
}

/**
 * 이미 조회된 질문 row 에 옵션/번역을 붙여 완전한 TodayQuestion 을 만듭니다.
 * `getTodayQuestion` / `getQuestionById` 공통 로직.
 */
async function enrichQuestion(
  row: { id: string; category: string; publish_date: string },
  locale: string,
): Promise<TodayQuestion | null> {
  const db = createServerSupabase();
  const chain = buildLocaleChain(locale);

  const [{ data: questionTranslations }, { data: rawOptions }] = await Promise.all([
    db
      .from("question_translations")
      .select("locale, text")
      .eq("question_id", row.id)
      .in("locale", chain),
    db
      .from("options")
      .select("id, sort_order")
      .eq("question_id", row.id)
      .order("sort_order", { ascending: true }),
  ]);

  const chosenQuestionT = pickByChain(questionTranslations, chain);
  if (!chosenQuestionT) return null;

  const options = rawOptions ?? [];
  if (options.length === 0) return null;

  const { data: optionTranslations } = await db
    .from("option_translations")
    .select("option_id, locale, text")
    .in(
      "option_id",
      options.map((o) => o.id),
    )
    .in("locale", chain);

  const translatedOptions: TodayQuestionOption[] = options.map((o) => {
    const forOption = optionTranslations?.filter((ot) => ot.option_id === o.id) ?? [];
    const chosen = pickByChain(forOption, chain);
    return {
      id: o.id,
      sortOrder: o.sort_order,
      text: chosen?.text ?? "",
    };
  });

  return {
    question: {
      id: row.id,
      category: row.category,
      publishDate: row.publish_date,
      text: chosenQuestionT.text,
    },
    options: translatedOptions,
    isTranslationFallback: !isSameLanguageFamily(locale, chosenQuestionT.locale),
  };
}

/**
 * 오늘의 live 질문 + 옵션 + 번역을 가져옵니다.
 * 로케일 매칭: `ko-kr` → `ko-kr` → `ko` → `en`.
 * 같은 언어 계열 폴백은 `isTranslationFallback=false`,
 * 완전히 다른 언어로 떨어졌을 때만 `true`.
 *
 * @see docs/DATABASE.md §4.1
 */
export async function getTodayQuestion(locale: string): Promise<TodayQuestion | null> {
  const db = createServerSupabase();
  const { data: question } = await db
    .from("questions")
    .select("id, category, publish_date")
    .eq("status", "live")
    .maybeSingle();
  if (!question) return null;
  return enrichQuestion(question, locale);
}

/**
 * 특정 질문 ID 로 질문 + 옵션 + 번역을 가져옵니다.
 * live/archived 에 상관없이 조회 가능하지만 노출은 RLS 에 의해 결정됩니다 —
 * 이 함수는 service_role 을 쓰므로 scheduled 질문도 조회됩니다. 호출부에서 의도를 검증할 것.
 */
export async function getQuestionById(
  questionId: string,
  locale: string,
): Promise<TodayQuestion | null> {
  const db = createServerSupabase();
  const { data: question } = await db
    .from("questions")
    .select("id, category, publish_date")
    .eq("id", questionId)
    .maybeSingle();
  if (!question) return null;
  return enrichQuestion(question, locale);
}
