"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Tag { id: string; name: string; slug: string; }

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function TagsManager({ tags: initial }: { tags: Tag[] }) {
  const [tags, setTags] = useState(initial);
  const [name, setName] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = () => createClient() as any;

  async function add() {
    if (!name.trim()) return;
    const { data } = await db().from("tags").insert({ name: name.trim(), slug: slugify(name) }).select().single();
    if (data) setTags((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    setName("");
  }

  async function remove(id: string) {
    await db().from("tags").delete().eq("id", id);
    setTags((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Add */}
      <div className="bg-white border border-[--color-rule] rounded-xl p-5">
        <p className="text-sm font-semibold mb-3">Add tag</p>
        <div className="flex gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Tag name (e.g. AI)"
            className="flex-1 border border-[--color-rule] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[--color-accent] transition-colors" />
          <button onClick={add} disabled={!name.trim()}
            className="border border-black text-black text-sm font-medium px-5 py-2 rounded-lg hover:bg-black hover:text-white transition-colors disabled:opacity-40">
            Add
          </button>
        </div>
      </div>

      {/* Tags grid */}
      <div className="bg-white border border-[--color-rule] rounded-xl p-5">
        {tags.length === 0 ? (
          <p className="text-sm text-[--color-text-muted] text-center py-6">No tags yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center gap-1.5 border border-black text-black text-xs font-semibold px-3 py-1.5 rounded-full">
                <span>{tag.name}</span>
                <button onClick={() => remove(tag.id)}
                  className="text-black hover:text-red-500 transition-colors leading-none font-bold ml-1">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
