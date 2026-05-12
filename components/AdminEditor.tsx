"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface Props {
  content?: { type: string; html?: string } | Record<string, unknown> | null;
  onChange: (value: { type: "html"; html: string }) => void;
  placeholder?: string;
}

const FONT_FAMILIES = ["Georgia", "Times New Roman", "Arial", "Courier New", "Verdana", "Trebuchet MS"];
const FONT_SIZES = [8, 10, 12, 14, 18, 24, 36];
const BLOCK_STYLES: { label: string; tag: string }[] = [
  { label: "Paragraph",    tag: "p" },
  { label: "Heading 1",    tag: "h1" },
  { label: "Heading 2",    tag: "h2" },
  { label: "Heading 3",    tag: "h3" },
  { label: "Blockquote",   tag: "blockquote" },
  { label: "Preformatted", tag: "pre" },
];

type ViewMode = "write" | "split" | "preview";

export default function AdminEditor({ content, onChange, placeholder = "Start writing your news article..." }: Props) {
  const editorRef   = useRef<HTMLDivElement>(null);
  const savedRange  = useRef<Range | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [status,    setStatus]    = useState("Ready");
  const [mode,      setMode]      = useState<ViewMode>("split");
  const [preview,   setPreview]   = useState("");
  const [textColor, setTextColor] = useState("#e24b4a");
  const [hlColor,   setHlColor]   = useState("#fac775");

  // Initialise content
  useEffect(() => {
    if (!editorRef.current) return;
    const html = typeof content === "object" && content !== null && "html" in content
      ? (content.html as string) ?? ""
      : "";
    editorRef.current.innerHTML = html;
    updateCounts(editorRef.current);
    setPreview(html);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateCounts(el: HTMLDivElement) {
    const text = el.innerText.trim();
    setWordCount(text ? text.split(/\s+/).length : 0);
    setCharCount(el.innerText.length);
  }

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    updateCounts(el);
    const html = el.innerHTML;
    setPreview(html);
    onChange({ type: "html", html });
  }, [onChange]);

  // Save/restore selection so color pickers don't lose cursor
  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange();
  }
  function restoreSelection() {
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  }

  function exec(cmd: string, val?: string) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    handleInput();
    setStatus(`Applied: ${cmd}`);
    setTimeout(() => setStatus("Ready"), 1500);
  }

  function applyBlock(tag: string) {
    exec("formatBlock", tag);
  }

  function insertLink() {
    restoreSelection();
    const url = window.prompt("Enter URL:", "https://");
    if (url) exec("createLink", url);
  }

  function copyHTML() {
    const html = editorRef.current?.innerHTML ?? "";
    navigator.clipboard.writeText(html).then(() => {
      setStatus("HTML copied to clipboard!");
      setTimeout(() => setStatus("Ready"), 2000);
    });
  }

  function applyFontSize(size: string) {
    // execCommand fontSize only accepts 1-7; use a workaround with span
    restoreSelection();
    exec("fontSize", "7");
    const spans = editorRef.current?.querySelectorAll("font[size='7']");
    spans?.forEach((s) => {
      (s as HTMLElement).removeAttribute("size");
      (s as HTMLElement).style.fontSize = `${size}px`;
    });
    handleInput();
  }

  // Keyboard shortcuts
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Tab") { e.preventDefault(); exec("indent"); }
    if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); copyHTML(); }
  }

  /* ── Toolbar helpers ─────────────────────────────────── */

  const Sep = () => <div className="w-px bg-gray-200 self-stretch mx-1" />;

  // onMouseDown preventDefault keeps focus inside the contenteditable
  function Btn({ title, onClick, active = false, children }: {
    title: string; onClick: () => void; active?: boolean; children: React.ReactNode;
  }) {
    return (
      <button
        type="button" title={title}
        onMouseDown={(e) => { e.preventDefault(); onClick(); }}
        className={`px-2 py-1 text-xs rounded border transition-colors min-w-7 flex items-center justify-center gap-0.5 ${
          active ? "text-white" : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
        }`}
        style={active ? { backgroundColor: "#5B3ADB", borderColor: "#5B3ADB" } : undefined}
      >
        {children}
      </button>
    );
  }

  const isActive = (cmd: string) => {
    try { return document.queryCommandState(cmd); } catch { return false; }
  };

  // SVG alignment icons
  const AlignLeftIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="0" y="1" width="14" height="2" rx="1"/><rect x="0" y="5" width="10" height="2" rx="1"/>
      <rect x="0" y="9" width="14" height="2" rx="1"/><rect x="0" y="13" width="8" height="1.5" rx="1"/>
    </svg>
  );
  const AlignCenterIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="0" y="1" width="14" height="2" rx="1"/><rect x="2" y="5" width="10" height="2" rx="1"/>
      <rect x="0" y="9" width="14" height="2" rx="1"/><rect x="3" y="13" width="8" height="1.5" rx="1"/>
    </svg>
  );
  const AlignRightIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="0" y="1" width="14" height="2" rx="1"/><rect x="4" y="5" width="10" height="2" rx="1"/>
      <rect x="0" y="9" width="14" height="2" rx="1"/><rect x="6" y="13" width="8" height="1.5" rx="1"/>
    </svg>
  );
  const JustifyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="0" y="1" width="14" height="2" rx="1"/><rect x="0" y="5" width="14" height="2" rx="1"/>
      <rect x="0" y="9" width="14" height="2" rx="1"/><rect x="0" y="13" width="14" height="1.5" rx="1"/>
    </svg>
  );
  const BulletIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <circle cx="2" cy="3" r="1.5"/><rect x="5" y="2" width="9" height="2" rx="1"/>
      <circle cx="2" cy="7" r="1.5"/><rect x="5" y="6" width="9" height="2" rx="1"/>
      <circle cx="2" cy="11" r="1.5"/><rect x="5" y="10" width="9" height="2" rx="1"/>
    </svg>
  );
  const NumberedIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <text x="0" y="4" fontSize="4" fontFamily="monospace">1.</text>
      <rect x="5" y="2" width="9" height="2" rx="1"/>
      <text x="0" y="8.5" fontSize="4" fontFamily="monospace">2.</text>
      <rect x="5" y="6.5" width="9" height="2" rx="1"/>
      <text x="0" y="13" fontSize="4" fontFamily="monospace">3.</text>
      <rect x="5" y="11" width="9" height="2" rx="1"/>
    </svg>
  );

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">

      {/* ── Toolbar ────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 space-y-1.5">

        {/* Row 1: history | block | font | mode toggle */}
        <div className="flex flex-wrap items-center gap-1">
          {/* History */}
          <Btn title="Undo (Ctrl+Z)" onClick={() => exec("undo")}>↩</Btn>
          <Btn title="Redo (Ctrl+Y)" onClick={() => exec("redo")}>↪</Btn>
          <Sep />

          {/* Block style */}
          <select
            onChange={(e) => applyBlock(e.target.value)}
            defaultValue=""
            onMouseDown={saveSelection}
            className="border border-gray-300 rounded text-xs px-2 py-1 bg-white text-gray-700 focus:outline-none focus:border-gray-500 max-w-32.5"
          >
            <option value="" disabled>Block style</option>
            {BLOCK_STYLES.map((s) => (
              <option key={s.tag} value={s.tag}>{s.label}</option>
            ))}
          </select>
          <Sep />

          {/* Font family */}
          <select
            onChange={(e) => exec("fontName", e.target.value)}
            defaultValue=""
            onMouseDown={saveSelection}
            className="border border-gray-300 rounded text-xs px-2 py-1 bg-white text-gray-700 focus:outline-none focus:border-gray-500 max-w-30"
          >
            <option value="" disabled>Font</option>
            {FONT_FAMILIES.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
            ))}
          </select>

          {/* Font size */}
          <select
            onChange={(e) => applyFontSize(e.target.value)}
            defaultValue=""
            onMouseDown={saveSelection}
            className="border border-gray-300 rounded text-xs px-2 py-1 bg-white text-gray-700 focus:outline-none focus:border-gray-500 w-16"
          >
            <option value="" disabled>Size</option>
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Sep />

          {/* Mode toggle — pushed to right */}
          <div className="ml-auto flex border border-gray-200 rounded-lg overflow-hidden text-xs font-medium">
            {(["write", "split", "preview"] as ViewMode[]).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`px-3 py-1.5 transition-colors ${
                  mode === m ? "bg-black text-white" : "text-gray-500 hover:text-black hover:bg-gray-100"
                }`}>
                {m === "write" ? "✏ Write" : m === "split" ? "⬛ Split" : "👁 Preview"}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: inline formatting | colors | alignment | lists | insert | utilities */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Inline format */}
          <Btn title="Bold (Ctrl+B)"        onClick={() => exec("bold")}          active={isActive("bold")}><strong>B</strong></Btn>
          <Btn title="Italic (Ctrl+I)"       onClick={() => exec("italic")}        active={isActive("italic")}><em>I</em></Btn>
          <Btn title="Underline (Ctrl+U)"    onClick={() => exec("underline")}     active={isActive("underline")}><span className="underline">U</span></Btn>
          <Btn title="Strikethrough"         onClick={() => exec("strikeThrough")} active={isActive("strikeThrough")}><s>S</s></Btn>
          <Btn title="Subscript"             onClick={() => exec("subscript")}     active={isActive("subscript")}>X₂</Btn>
          <Btn title="Superscript"           onClick={() => exec("superscript")}   active={isActive("superscript")}>X²</Btn>
          <Sep />

          {/* Shared color picker → Text or Highlight */}
          <div className="flex items-center border border-gray-300 rounded overflow-hidden">
            {/* Color swatch + picker */}
            <label title="Pick colour" className="flex items-center px-1.5 py-1 cursor-pointer hover:bg-gray-100 border-r border-gray-300 transition-colors">
              <span className="w-4 h-4 rounded-sm border border-gray-300 block"
                style={{ backgroundColor: textColor }} />
              <input type="color" value={textColor}
                onMouseDown={saveSelection}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-0 h-0 opacity-0 absolute pointer-events-none" />
            </label>
            {/* Apply as text colour */}
            <button type="button" title="Apply text colour"
              onMouseDown={(e) => { e.preventDefault(); restoreSelection(); exec("foreColor", textColor); }}
              className="px-2 py-1 text-xs font-bold hover:bg-gray-100 transition-colors border-r border-gray-300"
              style={{ color: textColor }}>A</button>
            {/* Apply as highlight */}
            <button type="button" title="Apply highlight colour"
              onMouseDown={(e) => { e.preventDefault(); restoreSelection(); exec("hiliteColor", textColor); }}
              className="px-2 py-1 text-xs font-bold hover:bg-gray-100 transition-colors"
              style={{ backgroundColor: textColor, color: "#fff" }}>H</button>
          </div>
          <Sep />

          {/* Alignment */}
          <Btn title="Align Left"   onClick={() => exec("justifyLeft")}   active={isActive("justifyLeft")}><AlignLeftIcon /></Btn>
          <Btn title="Align Center" onClick={() => exec("justifyCenter")} active={isActive("justifyCenter")}><AlignCenterIcon /></Btn>
          <Btn title="Align Right"  onClick={() => exec("justifyRight")}  active={isActive("justifyRight")}><AlignRightIcon /></Btn>
          <Btn title="Justify"      onClick={() => exec("justifyFull")}   active={isActive("justifyFull")}><JustifyIcon /></Btn>
          <Sep />

          {/* Lists */}
          <Btn title="Bullet List"   onClick={() => exec("insertUnorderedList")} active={isActive("insertUnorderedList")}><BulletIcon /></Btn>
          <Btn title="Numbered List" onClick={() => exec("insertOrderedList")}   active={isActive("insertOrderedList")}><NumberedIcon /></Btn>
          <Btn title="Outdent"       onClick={() => exec("outdent")}>⇤</Btn>
          <Btn title="Indent (Tab)"  onClick={() => exec("indent")}>⇥</Btn>
          <Sep />

          {/* Insert */}
          <Btn title="Insert Link"    onClick={insertLink}>🔗 Link</Btn>
          <Btn title="Remove Link"    onClick={() => exec("unlink")}>🔗✕</Btn>
          <Btn title="Horizontal Rule" onClick={() => exec("insertHTML", "<hr style='border:1px solid #e5e7eb;margin:1rem 0'>")}>─ HR</Btn>
          <Sep />

          {/* Utilities */}
          <Btn title="Clear Formatting" onClick={() => exec("removeFormat")}>Tx</Btn>
          <Btn title="Select All (Ctrl+A)" onClick={() => exec("selectAll")}>⊞ All</Btn>
          <Btn title="Copy HTML (Ctrl+Enter)" onClick={copyHTML}>⟨/⟩</Btn>
        </div>
      </div>

      {/* ── Panes ──────────────────────────────────────── */}
      <div className={`flex ${mode === "split" ? "divide-x divide-gray-200" : ""}`}>

        {/* Write pane */}
        {(mode === "write" || mode === "split") && (
          <div className={mode === "split" ? "w-1/2 flex flex-col" : "w-full"}>
            {mode === "split" && (
              <div className="px-4 py-1.5 border-b border-gray-100 bg-gray-50">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Write</span>
              </div>
            )}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onMouseUp={saveSelection}
              onKeyUp={saveSelection}
              data-placeholder={placeholder}
              className="flex-1 outline-none overflow-y-auto"
              style={{
                minHeight: "300px",
                maxHeight: "560px",
                padding: "20px 24px",
                fontSize: "16px",
                lineHeight: "1.7",
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            />
          </div>
        )}

        {/* Preview pane */}
        {(mode === "preview" || mode === "split") && (
          <div className={mode === "split" ? "w-1/2 flex flex-col" : "w-full"}>
            {mode === "split" && (
              <div className="px-4 py-1.5 border-b border-gray-100 bg-gray-50">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Preview</span>
              </div>
            )}
            <div
              className="flex-1 overflow-y-auto article-body"
              style={{ minHeight: "300px", maxHeight: "560px", padding: "20px 24px" }}
            >
              {preview && preview !== "<br>" ? (
                <div dangerouslySetInnerHTML={{ __html: preview }} />
              ) : (
                <p className="text-gray-400 italic text-sm">Nothing to preview yet…</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Status bar ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-gray-200 bg-gray-50 text-[11px] text-gray-400 font-mono">
        <span>{status}</span>
        <div className="flex gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
      </div>
    </div>
  );
}
