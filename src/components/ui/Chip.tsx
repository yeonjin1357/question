import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type Tone = "brand" | "neutral" | "accent";

const BASE =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors";

const TONES = {
  brand: {
    active: "bg-brand-500 text-white",
    idle: "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-300 dark:hover:bg-brand-900/40",
  },
  neutral: {
    active: "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900",
    idle: "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700",
  },
  accent: {
    active: "bg-accent-blue text-neutral-900",
    idle: "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
  },
} as const;

interface ChipStaticProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  active?: boolean;
  icon?: ReactNode;
}

export function Chip({
  tone = "brand",
  active = false,
  icon,
  className,
  children,
  ...rest
}: ChipStaticProps) {
  return (
    <span
      className={cn(BASE, active ? TONES[tone].active : TONES[tone].idle, className)}
      {...rest}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      {children}
    </span>
  );
}

interface ChipButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  active?: boolean;
  icon?: ReactNode;
}

export function ChipButton({
  tone = "brand",
  active = false,
  icon,
  className,
  children,
  ...rest
}: ChipButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        BASE,
        active ? TONES[tone].active : TONES[tone].idle,
        "cursor-pointer",
        className,
      )}
      {...rest}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      {children}
    </button>
  );
}
