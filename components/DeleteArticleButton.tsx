"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (createClient() as any).from("articles").delete().eq("id", id);
      router.refresh();
    });
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1">
        <button onClick={handleDelete} disabled={isPending}
          className="text-xs font-medium px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50">
          {isPending ? "…" : "Confirm"}
        </button>
        <button onClick={() => setConfirming(false)}
          className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button onClick={() => setConfirming(true)}
      className="text-xs font-medium px-3 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
      Delete
    </button>
  );
}
