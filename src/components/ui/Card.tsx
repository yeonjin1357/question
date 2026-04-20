import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type Variant = "elevated" | "flat" | "soft";

const VARIANTS: Record<Variant, string> = {
  elevated: "bg-white shadow-soft",
  flat: "bg-white border border-neutral-200",
  soft: "bg-brand-50",
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
