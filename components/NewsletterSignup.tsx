"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "./LanguageProvider";

export default function NewsletterSignup() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg,   setMsg]   = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (createClient() as any)
      .from("subscribers")
      .insert({ email: email.trim().toLowerCase() });

    if (error) {
      setState("error");
      setMsg(error.code === "23505" ? t("alreadySubscribed") : t("errorGeneric"));
    } else {
      setState("success");
      setMsg(t("newsletterSuccess"));
    }
  }

  return (
    <section className="bg-violet py-16 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">
          {t("newsletterLabel")}
        </p>
        <h2 className="text-3xl font-bold text-white mb-3" style={{ letterSpacing: "-0.02em" }}>
          {t("newsletterHeading")}
        </h2>
        <p className="text-white/70 text-sm mb-8 leading-relaxed">
          {t("newsletterBody")}
        </p>

        {state === "success" ? (
          <div className="bg-white/15 rounded-xl px-6 py-4 inline-block">
            <p className="text-white font-medium text-sm">✓ {msg}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletterInput")}
              className="flex-1 px-4 py-3 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit" disabled={state === "loading"}
              className="px-6 py-3 bg-white text-violet text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 shrink-0"
            >
              {state === "loading" ? t("newsletterBtnBusy") : t("newsletterBtn")}
            </button>
          </form>
        )}

        {state === "error" && (
          <p className="text-white/70 text-xs mt-3">{msg}</p>
        )}
      </div>
    </section>
  );
}
