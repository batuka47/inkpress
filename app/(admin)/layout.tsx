import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

const NAV = [
  { label: "Dashboard",     href: "/admin" },
  { label: "Articles",      href: "/admin/articles" },
  { label: "Breaking News", href: "/admin/breaking" },
  { label: "Categories",    href: "/admin/categories" },
  { label: "Tags",          href: "/admin/tags" },
  { label: "Subscribers",   href: "/admin/subscribers" },
  { label: "Authors",       href: "/admin/authors" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6]">
      <header className="bg-white text-black border-b border-[--color-rule] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold text-lg text-black" style={{ letterSpacing: "-0.03em" }}>
              AmjiltPressAgency
            </Link>
            <span className="text-[10px] font-semibold uppercase tracking-widest bg-[--color-accent] text-white px-2 py-0.5 rounded">
              Admin
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-black hover:bg-gray-100 rounded-md transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-gray-500 hover:text-black transition-colors">
              ← View Site
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
}
