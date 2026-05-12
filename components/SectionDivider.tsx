import Link from "next/link";

interface Props {
  label: string;
  href?: string;
  large?: boolean;
}

export default function SectionDivider({ label, href, large }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-1 rounded-full bg-[--color-accent]" style={{ height: large ? "28px" : "20px" }} />
        {href ? (
          <Link href={href} className="hover:text-[--color-accent] transition-colors">
            <span className={`font-bold text-[--color-text] ${large ? "text-2xl" : "text-lg"}`}>{label}</span>
          </Link>
        ) : (
          <span className={`font-bold text-[--color-text] ${large ? "text-2xl" : "text-lg"}`}>{label}</span>
        )}
      </div>
      {href && (
        <Link href={href} className="text-sm font-medium text-[--color-accent] hover:underline">
          View all →
        </Link>
      )}
    </div>
  );
}
