"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 bg-[--color-surface]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-bold text-2xl text-[--color-accent]" style={{ letterSpacing: "-0.03em" }}>
            AmjiltPressAgency
          </span>
          <p className="text-sm text-[--color-text-muted] mt-2">Sign in to the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[--color-rule] rounded-2xl p-8 space-y-4 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[--color-text-muted] mb-1">
              Email
            </label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-[--color-rule] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[--color-accent] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[--color-text-muted] mb-1">
              Password
            </label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[--color-rule] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[--color-accent] transition-colors"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full border border-black text-black font-medium text-sm py-2.5 rounded-lg hover:bg-black hover:text-white transition-colors disabled:opacity-40 mt-2"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
