interface Props {
  name: string;
  className?: string;
}

export default function CategoryBadge({ name, className = "" }: Props) {
  return (
    <span className={`category-badge ${className}`}>
      {name}
    </span>
  );
}
