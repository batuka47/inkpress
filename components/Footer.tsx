"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";

interface Category { name: string; name_mn?: string | null; slug: string; }

export default function Footer({ categories = [] }: { categories?: Category[] }) {
  const { locale, t } = useLanguage();
  const year = new Date().getFullYear();

  const defaultLinks = [
    { name: t("navPolitics"), slug: "politics" },
    { name: t("navTech"),     slug: "tech" },
    { name: t("navCulture"),  slug: "culture" },
    { name: t("navWorld"),    slug: "world" },
  ];

  const links = categories.length > 0 ? categories : defaultLinks;

  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="font-bold text-lg text-white" style={{ letterSpacing: "-0.03em" }}>
            AmjiltPress
          </span>
          <p className="text-xs mt-1 text-gray-500">{t("tagline")}</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm justify-center">
          {links.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`}
              className="text-gray-400 hover:text-white transition-colors">
              {locale === "mn" && cat.name_mn ? cat.name_mn : cat.name}
            </Link>
          ))}
          <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
            {t("navAbout")}
          </Link>
        </nav>
        <div className="flex flex-col items-center md:items-end gap-1">
          <Link href="/subscribe"
            className="text-xs font-semibold text-[--color-violet-muted] hover:text-white transition-colors border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-full">
            ✉ {t("navSubscribe")}
          </Link>
          <p className="text-xs text-gray-500">&copy; {year} AmjiltPress</p>
        </div>
      </div>
    </footer>
  );
}
