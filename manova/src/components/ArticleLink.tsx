import Link from 'next/link';

export function ArticleLink({
  slugOrId,
  children,
  className,
}: {
  slugOrId: string;
  children: React.ReactNode;
  className?: string;
}) {
  const href = `/articles/${slugOrId}`;
  return (
    <Link href={href} className={className} style={{ textDecoration: 'none', color: 'inherit' }}>
      {children}
    </Link>
  );
}
