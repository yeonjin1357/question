export const CATEGORY_EMOJI: Record<string, string> = {
  habits: "🌱",
  food: "🍽️",
  home: "🏠",
  tech: "📱",
  social: "💬",
  culture: "🌍",
  values: "⚖️",
  fun: "✨",
  work: "💼",
  travel: "✈️",
};

export function categoryEmoji(category: string | null | undefined): string {
  if (!category) return "❓";
  return CATEGORY_EMOJI[category] ?? "❓";
}
