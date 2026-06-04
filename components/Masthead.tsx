"use client";

import Link from "next/link";
import { useState } from "react";
import SearchBar from "./SearchBar";
import { useLanguage } from "./LanguageProvider";

interface Category { name: string; name_mn?: string | null; slug: string; is_main_nav?: boolean; }

interface Props {
  mainCategories?: Category[];
  extraCategories?: Category[];
}

export default function Masthead({ mainCategories = [], extraCategories = [] }: Props) {
  const { locale, setLocale, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const label = (c: Category) => (locale === "mn" && c.name_mn ? c.name_mn : c.name);

  const ABOUT = { label: locale === "mn" ? t("navAbout") : "About Us", href: "/about" };

  const allMobileLinks = [
    ...mainCategories.map(c => ({ label: label(c), href: `/category/${c.slug}` })),
    ...extraCategories.map(c => ({ label: label(c), href: `/category/${c.slug}` })),
    ABOUT,
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[--color-rule] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="AmjiltPressAgency logo" className="h-12 w-auto"
            style={{ filter: "brightness(0) saturate(100%) invert(24%) sepia(89%) saturate(1200%) hue-rotate(234deg) brightness(85%)" }} />
          <span className="font-bold text-xl text-[--color-accent] tracking-tight" style={{ letterSpacing: "-0.03em" }}>
            AmjiltPressAgency
          </span>
        </Link>

        {/* Nav — desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {mainCategories.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`}
              className="px-3 py-1.5 text-sm font-medium text-[--color-accent] hover:bg-[--color-accent-light] rounded-md transition-colors">
              {label(c)}
            </Link>
          ))}

          {/* About Us */}
          <Link href="/about"
            className="px-3 py-1.5 text-sm font-medium text-[--color-accent] hover:bg-[--color-accent-light] rounded-md transition-colors">
            {ABOUT.label}
          </Link>

          {/* Extra categories dropdown */}
          {extraCategories.length > 0 && (
            <div className="relative">
              <button onClick={() => setMoreOpen((v) => !v)}
                className="px-3 py-1.5 text-sm font-medium text-[--color-accent] hover:bg-[--color-accent-light] rounded-md transition-colors flex items-center gap-1">
                {t("navMore")}
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
                      {label(c)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <div className="w-44">
            <SearchBar compact />
          </div>

          {/* Language switcher */}
          <div className="flex items-center border border-[--color-rule] rounded-lg overflow-hidden text-xs font-semibold">
            {(["mn", "en"] as const).map((lang) => (
              <button key={lang} onClick={() => setLocale(lang)}
                className="px-2.5 py-1.5 transition-colors"
                style={locale === lang
                  ? { backgroundColor: "#5B3ADB", color: "#fff" }
                  : { backgroundColor: "#e5e7eb", color: "#6b7280" }
                }>
                {lang === "mn" ? "МОН" : "ENG"}
              </button>
            ))}
          </div>
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
          {allMobileLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-sm font-medium text-[--color-accent] py-1"
              onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center gap-3">
            <SearchBar compact />
            <div className="flex items-center border border-[--color-rule] rounded-lg overflow-hidden text-xs font-semibold ml-auto">
              {(["mn", "en"] as const).map((lang) => (
                <button key={lang} onClick={() => setLocale(lang)}
                  className="px-2.5 py-1.5 transition-colors"
                  style={locale === lang
                    ? { backgroundColor: "#5B3ADB", color: "#fff" }
                    : { backgroundColor: "#e5e7eb", color: "#6b7280" }
                  }>
                  {lang === "mn" ? "МОН" : "ENG"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
