import { Globe2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight",
        className,
      )}
    >
      <span
        aria-hidden
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white shadow-soft"
      >
        <Globe2 size={18} strokeWidth={2.5} />
      </span>
      <span className="text-neutral-900 dark:text-neutral-100">
        OneQ<span className="text-brand-500">.</span>
      </span>
    </span>
  );
}
