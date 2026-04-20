import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type Variant = "elevated" | "flat" | "soft";

const VARIANTS: Record<Variant, string> = {
  elevated:
    "bg-white shadow-soft dark:bg-neutral-900 dark:shadow-[0_4px_20px_-4px_rgb(0_0_0/0.5)]",
  flat: "bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800",
  soft: "bg-brand-50 dark:bg-brand-950/40",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padded?: boolean;
}

export function Card({
  variant = "elevated",
  padded = true,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl",
        VARIANTS[variant],
        padded && "p-6 sm:p-8",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
