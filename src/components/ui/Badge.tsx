import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "brand" | "neutral";
}

export function Badge({ tone = "neutral", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold font-display",
        tone === "brand" ? "bg-brand-500 text-white" : "bg-neutral-100 text-neutral-600",
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
