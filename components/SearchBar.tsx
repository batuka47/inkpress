"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface Props {
  defaultValue?: string;
  compact?: boolean;
  dark?: boolean;
}

export default function SearchBar({ defaultValue, compact = false, dark = false }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q") as string;
    if (!q.trim()) return;
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    });
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} role="search">
        <input
          type="search"
          name="q"
          defaultValue={searchParams.get("q") ?? defaultValue}
          placeholder="Search..."
          aria-label="Search articles"
          className={`w-full bg-transparent border-b text-sm py-1 outline-none transition-colors placeholder:text-opacity-50 ${
            dark
              ? "border-white/20 focus:border-[--color-accent] text-white placeholder:text-gray-400"
              : "border-[--color-rule] focus:border-[--color-accent] text-[--color-text] placeholder:text-[--color-text-muted]"
          }`}
        />
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex gap-2">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search articles..."
        aria-label="Search articles"
        className="flex-1 border border-[--color-rule] rounded-lg bg-white px-4 py-2 text-sm text-[--color-text] placeholder:text-[--color-text-muted] focus:outline-none focus:border-[--color-accent] transition-colors"
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-[--color-accent] text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-[--color-accent-dark] transition-colors disabled:opacity-60"
      >
        {isPending ? "…" : "Search"}
      </button>
    </form>
  );
}
