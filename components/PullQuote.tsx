interface Props {
  children: React.ReactNode;
  attribution?: string;
}

export default function PullQuote({ children, attribution }: Props) {
  return (
    <blockquote className="pull-quote my-8">
      <p className="relative z-10">{children}</p>
      {attribution && (
        <footer className="font-(family-name:--font-dm-mono) text-xs text-[--color-text-muted] uppercase tracking-wider mt-3 not-italic">
          &mdash; {attribution}
        </footer>
      )}
    </blockquote>
  );
}
