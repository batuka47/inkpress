"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Role = "editor" | "journalist" | "contributor";

interface Author {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  role: Role;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createClient() as any;

const ROLE_COLORS: Record<Role, string> = {
  editor:      "bg-purple-100 text-purple-700",
  journalist:  "bg-blue-100 text-blue-700",
  contributor: "bg-gray-100 text-gray-600",
};

const ROLE_LABELS: Record<Role, string> = {
  editor:      "Editor",
  journalist:  "Journalist",
  contributor: "Contributor",
};

export default function AuthorsManager({ authors: initial }: { authors: Author[] }) {
  const [authors, setAuthors] = useState(initial);
  const [editId, setEditId]   = useState<string | null>(null);
  const [editName, setEditName]       = useState("");
  const [editBio, setEditBio]         = useState("");
  const [editRole, setEditRole]       = useState<Role>("journalist");
  const [editAvatar, setEditAvatar]   = useState("");
  const [uploading, setUploading]     = useState(false);
  const [saving, setSaving]           = useState(false);

  function startEdit(a: Author) {
    setEditId(a.id);
    setEditName(a.display_name);
    setEditBio(a.bio ?? "");
    setEditRole(a.role);
    setEditAvatar(a.avatar_url ?? "");
  }

  function cancelEdit() { setEditId(null); }

  async function uploadAvatar(file: File) {
    const supabase = createClient();
    const ext  = file.name.split(".").pop();
    const path = `avatars/${crypto.randomUUID()}.${ext}`;
    setUploading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).storage
      .from("article-images")
      .upload(path, file, { contentType: file.type });
    setUploading(false);
    if (error || !data) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { publicUrl } } = (supabase as any).storage
      .from("article-images")
      .getPublicUrl(data.path);
    setEditAvatar(publicUrl);
  }

  async function save() {
    if (!editId) return;
    setSaving(true);
    const { data, error } = await db()
      .from("authors")
      .update({
        display_name: editName.trim(),
        bio:          editBio.trim() || null,
        role:         editRole,
        avatar_url:   editAvatar || null,
      })
      .eq("id", editId)
      .select("id, display_name, bio, avatar_url, role")
      .single();
    setSaving(false);
    if (!error && data) {
      setAuthors(prev => prev.map(a => a.id === editId ? data : a));
      setEditId(null);
    }
  }

  const fieldCls = "w-full border border-[--color-rule] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[--color-accent] transition-colors";

  return (
    <div className="bg-white border border-[--color-rule] rounded-xl overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-12 gap-4 px-5 py-2.5 bg-[#F9FAFB] border-b border-[--color-rule] text-xs font-semibold uppercase tracking-widest text-[--color-text-muted]">
        <span className="col-span-1">Photo</span>
        <span className="col-span-3">Name</span>
        <span className="col-span-2">Role</span>
        <span className="col-span-4">Bio</span>
        <span className="col-span-2">Actions</span>
      </div>

      {authors.length === 0 ? (
        <p className="text-sm text-[--color-text-muted] text-center py-10">No authors yet.</p>
      ) : authors.map((author) => (
        <div key={author.id} className="border-b border-[--color-rule] last:border-0">
          {editId === author.id ? (
            /* ── Edit mode ── */
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[--color-text-muted] mb-1">Name</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} className={fieldCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[--color-text-muted] mb-1">Role</label>
                  <select value={editRole} onChange={e => setEditRole(e.target.value as Role)} className={fieldCls}>
                    <option value="editor">Editor</option>
                    <option value="journalist">Journalist</option>
                    <option value="contributor">Contributor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[--color-text-muted] mb-1">Bio</label>
                <textarea value={editBio} onChange={e => setEditBio(e.target.value)}
                  rows={2} className={fieldCls} placeholder="Short biography…" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[--color-text-muted] mb-1">Profile Photo</label>
                <div className="flex items-center gap-3">
                  {editAvatar && (
                    <img src={editAvatar} alt="" className="w-10 h-10 rounded-full object-cover border border-[--color-rule]" />
                  )}
                  <label className="border border-[--color-rule] rounded-lg px-4 py-2 text-xs font-medium cursor-pointer hover:border-[--color-accent] transition-colors">
                    {uploading ? "Uploading…" : "Upload photo"}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
                  </label>
                  {editAvatar && (
                    <button type="button" onClick={() => setEditAvatar("")}
                      className="text-xs text-red-500 hover:underline">Remove</button>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={save} disabled={saving}
                  className="border border-black text-black text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-black hover:text-white transition-colors disabled:opacity-40">
                  {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={cancelEdit}
                  className="border border-[--color-rule] text-xs font-medium px-4 py-1.5 rounded-lg text-[--color-text-muted] hover:border-black hover:text-black transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* ── View mode ── */
            <div className="grid grid-cols-12 gap-4 px-5 py-3 items-center">
              <div className="col-span-1">
                {author.avatar_url ? (
                  <img src={author.avatar_url} alt={author.display_name}
                    className="w-9 h-9 rounded-full object-cover border border-[--color-rule]" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[--color-accent-light] flex items-center justify-center">
                    <span className="text-[--color-accent] font-bold text-sm">
                      {author.display_name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <span className="col-span-3 text-sm font-medium text-[--color-text]">
                {author.display_name}
              </span>
              <span className="col-span-2">
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${ROLE_COLORS[author.role]}`}>
                  {ROLE_LABELS[author.role]}
                </span>
              </span>
              <span className="col-span-4 text-xs text-[--color-text-muted] line-clamp-2">
                {author.bio ?? <span className="italic text-gray-300">No bio yet</span>}
              </span>
              <div className="col-span-2">
                <button onClick={() => startEdit(author)}
                  className="text-xs font-medium px-3 py-1 rounded-full bg-[--color-accent-light] text-[--color-accent] hover:bg-violet-200 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
