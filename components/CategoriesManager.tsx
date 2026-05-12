"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color_hex: string | null;
  display_order: number | null;
}

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function CategoriesManager({ categories: initial }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = () => createClient() as any;

  async function add() {
    if (!name.trim()) return;
    const { data } = await db().from("categories").insert({
      name: name.trim(),
      slug: slugify(name),
      description: description.trim() || null,
      display_order: categories.length + 1,
    }).select().single();
    if (data) setCategories((prev) => [...prev, data]);
    setName(""); setDescription("");
  }

  async function save(id: string) {
    const { data } = await db().from("categories")
      .update({ name: editName.trim(), slug: slugify(editName), description: editDesc.trim() || null })
      .eq("id", id).select().single();
    if (data) setCategories((prev) => prev.map((c) => c.id === id ? data : c));
    setEditId(null);
  }

  async function remove(id: string) {
    await db().from("categories").delete().eq("id", id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  const fieldCls = "border border-[--color-rule] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[--color-accent] transition-colors";

  return (
    <div className="space-y-6">
      {/* Add */}
      <div className="bg-white border border-[--color-rule] rounded-xl p-5 space-y-3">
        <p className="text-sm font-semibold">Create category</p>
        <div className="grid grid-cols-2 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g. Politics)" className={fieldCls} />
          <input value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)" className={fieldCls} />
        </div>
        <button onClick={add} disabled={!name.trim()}
          className="border border-black text-black text-sm font-medium px-5 py-2 rounded-lg hover:bg-black hover:text-white transition-colors disabled:opacity-40">
          Create Category
        </button>
      </div>

      {/* List */}
      <div className="bg-white border border-[--color-rule] rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-2.5 bg-[#F9FAFB] border-b border-[--color-rule] text-xs font-semibold uppercase tracking-widest text-[--color-text-muted]">
          <span className="col-span-3">Name</span>
          <span className="col-span-2">Slug</span>
          <span className="col-span-5">Description</span>
          <span className="col-span-2">Actions</span>
        </div>

        {categories.length === 0 ? (
          <p className="text-sm text-[--color-text-muted] text-center py-10">No categories yet.</p>
        ) : categories.map((cat) => (
          <div key={cat.id} className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-[--color-rule] last:border-0 items-center">
            {editId === cat.id ? (
              <>
                <input value={editName} onChange={(e) => setEditName(e.target.value)}
                  className={`col-span-3 ${fieldCls}`} />
                <span className="col-span-2 text-xs text-[--color-text-muted]">{slugify(editName)}</span>
                <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                  className={`col-span-5 ${fieldCls}`} />
                <div className="col-span-2 flex gap-2">
                  <button onClick={() => save(cat.id)}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                    Save
                  </button>
                  <button onClick={() => setEditId(null)}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="col-span-3 text-sm font-medium">{cat.name}</span>
                <span className="col-span-2 text-xs text-[--color-text-muted] font-mono">{cat.slug}</span>
                <span className="col-span-5 text-xs text-[--color-text-muted] line-clamp-1">{cat.description ?? "—"}</span>
                <div className="col-span-2 flex gap-2">
                  <button onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditDesc(cat.description ?? ""); }}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-[--color-accent-light] text-[--color-accent] hover:bg-violet-200 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => remove(cat.id)}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
