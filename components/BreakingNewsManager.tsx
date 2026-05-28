"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Item {
  id: string;
  text: string;
  text_mn: string | null;
  active: boolean;
  created_at: string;
  link_article_id: string | null;
  articles?: { title: string; slug: string } | null;
}

interface Article { id: string; title: string; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createClient() as any;

export default function BreakingNewsManager({ items: initial, articles }: { items: Item[]; articles: Article[] }) {
  const [items, setItems]         = useState(initial);
  const [text, setText]           = useState("");
  const [textMn, setTextMn]       = useState("");
  const [articleId, setArticleId] = useState("");
  const [search, setSearch]       = useState("");

  // Edit state
  const [editId,        setEditId]        = useState<string | null>(null);
  const [editText,      setEditText]      = useState("");
  const [editTextMn,    setEditTextMn]    = useState("");
  const [editArticleId, setEditArticleId] = useState("");
  const [editSearch,    setEditSearch]    = useState("");

  const filtered = (q: string) =>
    articles.filter((a) => a.title.toLowerCase().includes(q.toLowerCase()));

  async function add() {
    if (!text.trim()) return;
    const { data } = await db()
      .from("breaking_news")
      .insert({ text: text.trim(), text_mn: textMn.trim() || null, active: true, link_article_id: articleId || null })
      .select("*, articles(title, slug)")
      .single();
    if (data) setItems((prev: Item[]) => [data, ...prev]);
    setText(""); setTextMn(""); setArticleId(""); setSearch("");
  }

  function startEdit(item: Item) {
    setEditId(item.id);
    setEditText(item.text);
    setEditTextMn(item.text_mn ?? "");
    setEditArticleId(item.link_article_id ?? "");
    setEditSearch(item.articles?.title ?? "");
  }

  async function saveEdit(id: string) {
    const { data } = await db()
      .from("breaking_news")
      .update({ text: editText.trim(), text_mn: editTextMn.trim() || null, link_article_id: editArticleId || null })
      .eq("id", id)
      .select("*, articles(title, slug)")
      .single();
    if (data) setItems((prev: Item[]) => prev.map((i) => i.id === id ? data : i));
    setEditId(null);
  }

  async function toggle(id: string, active: boolean) {
    await db().from("breaking_news").update({ active: !active }).eq("id", id);
    setItems((prev: Item[]) => prev.map((i) => i.id === id ? { ...i, active: !active } : i));
  }

  async function remove(id: string) {
    await db().from("breaking_news").delete().eq("id", id);
    setItems((prev: Item[]) => prev.filter((i) => i.id !== id));
  }

  const fieldCls = "border border-[--color-rule] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[--color-accent] transition-colors";

  function ArticleSearch({ value, onChange, onSelect, articleId: selId, onClear }: {
    value: string; onChange: (v: string) => void;
    onSelect: (id: string, title: string) => void;
    articleId: string; onClear: () => void;
  }) {
    return (
      <div>
        <input value={value} onChange={(e) => { onChange(e.target.value); if (selId) onClear(); }}
          placeholder="Search articles to link…" className={`w-full ${fieldCls}`} />
        {value && !selId && filtered(value).length > 0 && (
          <div className="border border-[--color-rule] rounded-lg overflow-hidden max-h-40 overflow-y-auto mt-1">
            {filtered(value).map((a) => (
              <button key={a.id} type="button"
                onClick={() => onSelect(a.id, a.title)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[--color-accent-light] transition-colors border-b border-[--color-rule] last:border-0">
                {a.title}
              </button>
            ))}
          </div>
        )}
        {selId && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-[--color-accent] font-medium">✓ Linked</span>
            <button type="button" onClick={onClear}
              className="text-xs text-[--color-text-muted] hover:text-red-500 transition-colors">Remove</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="bg-white border border-[--color-rule] rounded-xl p-5 space-y-4">
        <p className="text-sm font-semibold">Add breaking news</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[--color-text-muted] mb-1">
              Text — English *
            </label>
            <input value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Breaking news headline in English…" className={`w-full ${fieldCls}`} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[--color-text-muted] mb-1">
              Текст — Монгол
            </label>
            <input value={textMn} onChange={(e) => setTextMn(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Яаралтай мэдээний гарчиг монгол хэлээр…" className={`w-full ${fieldCls}`} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[--color-text-muted] mb-1">Link to article (optional)</label>
          <ArticleSearch
            value={search} onChange={setSearch}
            onSelect={(id, title) => { setArticleId(id); setSearch(title); }}
            articleId={articleId} onClear={() => { setArticleId(""); setSearch(""); }}
          />
        </div>

        <button onClick={add} disabled={!text.trim()}
          className="border border-black text-black text-sm font-medium px-5 py-2 rounded-lg hover:bg-black hover:text-white transition-colors disabled:opacity-40">
          Add Breaking News
        </button>
      </div>

      {/* List */}
      <div className="bg-white border border-[--color-rule] rounded-xl overflow-hidden">
        {items.length === 0 ? (
          <p className="text-sm text-[--color-text-muted] text-center py-10">No breaking news items.</p>
        ) : items.map((item) => (
          <div key={item.id} className="px-5 py-4 border-b border-[--color-rule] last:border-0">
            {editId === item.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={editText} onChange={(e) => setEditText(e.target.value)}
                    placeholder="English" className={`w-full ${fieldCls}`} />
                  <input value={editTextMn} onChange={(e) => setEditTextMn(e.target.value)}
                    placeholder="Монгол" className={`w-full ${fieldCls}`} />
                </div>
                <ArticleSearch
                  value={editSearch} onChange={setEditSearch}
                  onSelect={(id, title) => { setEditArticleId(id); setEditSearch(title); }}
                  articleId={editArticleId} onClear={() => { setEditArticleId(""); setEditSearch(""); }}
                />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(item.id)}
                    className="border border-black text-black text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-black hover:text-white transition-colors">Save</button>
                  <button onClick={() => setEditId(null)}
                    className="border border-[--color-rule] text-xs font-medium px-4 py-1.5 rounded-lg text-[--color-text-muted] hover:border-black hover:text-black transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${item.active ? "bg-green-500" : "bg-gray-300"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[--color-text]">{item.text}</p>
                  {item.text_mn && (
                    <p className="text-xs text-[--color-text-muted] mt-0.5 italic">{item.text_mn}</p>
                  )}
                  {item.articles && (
                    <p className="text-xs text-[--color-accent] mt-0.5 truncate">→ {item.articles.title}</p>
                  )}
                  <p className="text-xs text-[--color-text-muted] mt-0.5">
                    {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => startEdit(item)}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-[--color-accent-light] text-[--color-accent] hover:bg-violet-200 transition-colors">Edit</button>
                  <button onClick={() => toggle(item.id, item.active)}
                    className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                      item.active ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}>
                    {item.active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => remove(item.id)}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
