"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SearchBoxProps {
  placeholder: string;
  clearLabel: string;
}

/**
 * 아카이브 상단 검색 입력. 300ms 디바운스 후 URL query 의 `q` 를 갱신해
 * Server Component 가 재렌더되면서 검색 결과를 표시한다.
 *
 * `cursor` 는 검색어가 바뀌면 의미가 없어져 함께 제거.
 */
export function SearchBox({ placeholder, clearLabel }: SearchBoxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const handle = setTimeout(() => {
      const next = new URLSearchParams(Array.from(params.entries()));
      const trimmed = value.trim();
      if (trimmed) next.set("q", trimmed);
      else next.delete("q");
      next.delete("cursor");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 300);
    return () => clearTimeout(handle);
    // params 는 외부 변화 반응 안 함 — 사용자 타이핑에만 의존.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative">
      <Search
        size={16}
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
      />
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        maxLength={100}
        className="w-full appearance-none rounded-full border-2 border-neutral-200 bg-white px-10 py-2.5 text-sm transition-colors placeholder:text-neutral-400 focus:border-brand-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-brand-500 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-ms-clear]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label={clearLabel}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}
