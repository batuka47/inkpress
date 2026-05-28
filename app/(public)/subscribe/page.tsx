"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

export default function SubscribePage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [name,  setName]  = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg,   setMsg]   = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (createClient() as any)
      .from("subscribers")
      .insert({ email: email.trim().toLowerCase(), name: name.trim() || null });

    if (error) {
      setState("error");
      setMsg(error.code === "23505" ? t("alreadySubscribed") : error.message);
    } else {
      setState("success");
      setMsg(t("subscribePage_success"));
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 bg-[--color-surface]">
      <div className="w-full max-w-md">
        <div className="bg-white border border-[--color-rule] rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <span className="text-3xl">✉️</span>
            <h1 className="text-2xl font-bold mt-3 mb-2" style={{ letterSpacing: "-0.02em" }}>
              {t("subscribePage_title")}
            </h1>
            <p className="text-sm text-[--color-text-muted]">
              {t("subscribePage_subtitle")}
            </p>
          </div>

          {state === "success" ? (
            <div className="text-center py-6">
              <p className="text-green-600 font-medium text-sm">{msg}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[--color-text-muted] mb-1">
                  {t("subscribePage_name")}
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={t("subscribePage_namePh")}
                  className="w-full border border-[--color-rule] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[--color-accent] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[--color-text-muted] mb-1">
                  {t("subscribePage_email")}
                </label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("subscribePage_emailPh")}
                  className="w-full border border-[--color-rule] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[--color-accent] transition-colors" />
              </div>

              {state === "error" && (
                <p className="text-sm text-red-600">{msg}</p>
              )}

              <button type="submit" disabled={state === "loading"}
                className="w-full border border-black text-black text-sm font-medium py-2.5 rounded-lg hover:bg-black hover:text-white transition-colors disabled:opacity-50 mt-2">
                {state === "loading" ? t("subscribePage_btnBusy") : t("subscribePage_btn")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
