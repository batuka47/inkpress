"use client";

import Link from "next/link";
import { useState } from "react";
import SearchBar from "./SearchBar";

const MAIN_LINKS = [
  { label: "Politics", href: "/category/politics" },
  { label: "Tech",     href: "/category/tech" },
  { label: "Culture",  href: "/category/culture" },
  { label: "World",    href: "/category/world" },
];

interface Category { name: string; slug: string; }

interface Props {
  extraCategories?: Category[];
}

export default function Masthead({ extraCategories = [] }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const allLinks = [
    ...MAIN_LINKS,
    ...extraCategories.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[--color-rule] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <Link href="/" className="font-bold text-xl text-[--color-accent] tracking-tight shrink-0"
          style={{ letterSpacing: "-0.03em" }}>
          InkPress
        </Link>

        {/* Nav — desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {MAIN_LINKS.map((link) => (
            <Link key={link.href} href={link.href}
              className="px-3 py-1.5 text-sm font-medium text-[--color-accent] hover:bg-[--color-accent-light] rounded-md transition-colors">
              {link.label}
            </Link>
          ))}

          {/* Extra categories dropdown */}
          {extraCategories.length > 0 && (
            <div className="relative">
              <button onClick={() => setMoreOpen((v) => !v)}
                className="px-3 py-1.5 text-sm font-medium text-[--color-accent] hover:bg-[--color-accent-light] rounded-md transition-colors flex items-center gap-1">
                More
                <svg className={`w-3 h-3 transition-transform ${moreOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {moreOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-[--color-rule] rounded-xl shadow-lg py-1 min-w-40 z-50">
                  {extraCategories.map((c) => (
                    <Link key={c.slug} href={`/category/${c.slug}`}
                      onClick={() => setMoreOpen(false)}
                      className="block px-4 py-2 text-sm text-[--color-accent] hover:bg-[--color-accent-light] transition-colors">
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="hidden md:block w-48">
          <SearchBar compact />
        </div>

        <button className="md:hidden text-[--color-accent] p-1"
          onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[--color-rule] px-6 py-4 flex flex-col gap-2">
          {allLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-sm font-medium text-[--color-accent] py-1"
              onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="mt-2"><SearchBar compact /></div>
        </div>
      )}
    </header>
  );
}
