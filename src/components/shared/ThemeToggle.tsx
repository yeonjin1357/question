"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle({ label }: { label: string }) {
  const { resolved, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-neutral-300 dark:hover:bg-brand-950/40 dark:hover:text-brand-300"
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted ? (
          resolved === "dark" ? (
            <motion.span
              key="moon"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon size={18} />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun size={18} />
            </motion.span>
          )
        ) : (
          <span className="absolute inset-0 flex items-center justify-center">
            <Sun size={18} aria-hidden />
          </span>
        )}
      </AnimatePresence>
    </button>
  );
}
