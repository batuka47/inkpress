"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className="text-xs font-medium text-gray-600 hover:text-black border border-[--color-rule] hover:border-gray-400 px-3 py-1.5 rounded-md transition-colors"
    >
      Sign out
    </button>
  );
}
