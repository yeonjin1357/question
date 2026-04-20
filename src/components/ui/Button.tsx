import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-500 text-white shadow-soft hover:bg-brand-600 hover:shadow-pop active:scale-[0.98]",
  secondary:
    "bg-white text-neutral-900 border-2 border-neutral-200 hover:border-brand-300 hover:bg-brand-50 active:scale-[0.98]",
  ghost: "bg-transparent text-neutral-700 hover:bg-neutral-100 active:scale-[0.98]",
};

const SIZES: Record<Size, string> = {
  sm: "rounded-full px-3 py-1.5 text-sm",
  md: "rounded-full px-5 py-2.5 text-sm",
  lg: "rounded-full px-7 py-3 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : leftIcon ? (
        <span aria-hidden>{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon ? <span aria-hidden>{rightIcon}</span> : null}
    </button>
  );
}
