import Image from "next/image";
import type { Database } from "@/types/database";

type Author = Database["public"]["Tables"]["authors"]["Row"];

interface Props {
  author: Author;
  showBio?: boolean;
}

export default function AuthorCard({ author, showBio = false }: Props) {
  return (
    <div className="flex items-center gap-3">
      {author.avatar_url ? (
        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
          <Image src={author.avatar_url} alt={author.display_name} fill className="object-cover" />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-[--color-accent-light] flex items-center justify-center shrink-0">
          <span className="font-(family-name:--font-playfair) font-bold text-[--color-accent] text-sm">
            {author.display_name.charAt(0)}
          </span>
        </div>
      )}
      <div>
        <p className="font-(family-name:--font-source-serif) font-semibold text-sm text-[--color-text] leading-tight">
          {author.display_name}
        </p>
        <p className="font-(family-name:--font-dm-mono) text-xs text-[--color-text-muted] capitalize">
          {author.role}
        </p>
        {showBio && author.bio && (
          <p className="font-(family-name:--font-source-serif) text-sm text-[--color-text-muted] mt-1 leading-relaxed">
            {author.bio}
          </p>
        )}
      </div>
    </div>
  );
}
