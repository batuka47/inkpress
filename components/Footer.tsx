import Link from "next/link";

interface Category { name: string; slug: string; }

export default function Footer({ categories = [] }: { categories?: Category[] }) {
  const year = new Date().getFullYear();
  const links = categories.length > 0
    ? categories
    : [
        { name: "Politics", slug: "politics" },
        { name: "Tech",     slug: "tech" },
        { name: "Culture",  slug: "culture" },
        { name: "World",    slug: "world" },
      ];

  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="font-bold text-lg text-white" style={{ letterSpacing: "-0.03em" }}>
            Ink<span className="text-[--color-violet-muted]">Press</span>
          </span>
          <p className="text-xs mt-1 text-gray-500">News as it should be read.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm justify-center">
          {links.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`}
              className="text-gray-400 hover:text-white transition-colors">
              {cat.name}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col items-center md:items-end gap-1">
          <a href="/subscribe"
            className="text-xs font-semibold text-[--color-violet-muted] hover:text-white transition-colors border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-full">
            ✉ Subscribe
          </a>
          <p className="text-xs text-gray-500">&copy; {year} InkPress</p>
        </div>
      </div>
    </footer>
  );
}
