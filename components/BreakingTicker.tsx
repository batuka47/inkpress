"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type BreakingItem = Database["public"]["Tables"]["breaking_news"]["Row"];

export default function BreakingTicker({ items: initial }: { items: BreakingItem[] }) {
  const [items, setItems] = useState(initial);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("breaking_news")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "breaking_news" },
        (payload) => {
          const row = payload.new as BreakingItem;
          if (row.active) setItems((prev) => [row, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const doubled = [...items, ...items];

  return (
    <div
      className="bg-[--color-ink-black] text-[--color-white-warm] overflow-hidden"
      role="marquee"
      aria-label="Breaking news"
    >
      <div className="flex items-center">
        <span className="shrink-0 bg-[--color-accent] font-(family-name:--font-dm-mono) text-xs uppercase tracking-widest px-4 py-2 z-10 font-medium">
          Breaking
        </span>
        <div className="overflow-hidden flex-1">
          <div className="ticker-track py-2">
            {doubled.map((item, i) => (
              <span key={`${item.id}-${i}`} className="inline-flex items-center">
                <span className="text-[--color-accent] mx-4" aria-hidden>&#9679;</span>
                {item.link_article_id ? (
                  <Link
                    href={`/article/${item.link_article_id}`}
                    className="font-(family-name:--font-dm-mono) text-xs hover:text-[--color-accent] transition-colors whitespace-nowrap"
                  >
                    {item.text}
                  </Link>
                ) : (
                  <span className="font-(family-name:--font-dm-mono) text-xs whitespace-nowrap">
                    {item.text}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
