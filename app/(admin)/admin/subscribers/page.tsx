import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SubscribersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscribers } = await (supabase as any)
    .from("subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false });

  const total  = subscribers?.length ?? 0;
  const active = subscribers?.filter((s: { active: boolean }) => s.active).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Subscribers</h1>
        <div className="flex gap-3">
          <span className="text-sm text-[--color-text-muted] bg-white border border-[--color-rule] rounded-lg px-4 py-2">
            {active} active · {total} total
          </span>
        </div>
      </div>

      <div className="bg-white border border-[--color-rule] rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-2.5 bg-[#F9FAFB] border-b border-[--color-rule] text-xs font-semibold uppercase tracking-widest text-[--color-text-muted]">
          <span className="col-span-4">Email</span>
          <span className="col-span-3">Name</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-3">Subscribed</span>
        </div>

        {!subscribers || subscribers.length === 0 ? (
          <p className="text-sm text-[--color-text-muted] text-center py-12">
            No subscribers yet. Share the <a href="/subscribe" className="text-[--color-accent] hover:underline">/subscribe</a> page to get started.
          </p>
        ) : subscribers.map((sub: { id: string; email: string; name: string | null; active: boolean; subscribed_at: string }) => (
          <div key={sub.id} className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-[--color-rule] last:border-0 items-center hover:bg-[#F9FAFB] transition-colors">
            <span className="col-span-4 text-sm font-medium text-[--color-text] truncate">{sub.email}</span>
            <span className="col-span-3 text-sm text-[--color-text-muted]">{sub.name ?? "—"}</span>
            <span className="col-span-2">
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                sub.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}>
                {sub.active ? "Active" : "Unsubscribed"}
              </span>
            </span>
            <span className="col-span-3 text-xs text-[--color-text-muted]">
              {new Date(sub.subscribed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
