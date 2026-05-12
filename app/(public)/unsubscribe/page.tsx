"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function UnsubscribeForm() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    if (!email) return;
    setState("loading");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createClient() as any)
      .from("subscribers")
      .update({ active: false })
      .eq("email", email.toLowerCase())
      .then(({ error }: { error: unknown }) => {
        setState(error ? "error" : "done");
      });
  }, [email]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {state === "loading" && <p className="text-[--color-text-muted] text-sm">Unsubscribing…</p>}
        {state === "done" && (
          <>
            <p className="text-2xl mb-3">👋</p>
            <h1 className="text-xl font-bold mb-2">You&apos;re unsubscribed</h1>
            <p className="text-sm text-[--color-text-muted]">
              <strong>{email}</strong> has been removed from our mailing list.
            </p>
          </>
        )}
        {state === "error" && (
          <p className="text-red-600 text-sm">Something went wrong. Please try again.</p>
        )}
        {!email && (
          <p className="text-[--color-text-muted] text-sm">No email address provided.</p>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return <Suspense><UnsubscribeForm /></Suspense>;
}
