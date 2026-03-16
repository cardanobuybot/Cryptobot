import Link from 'next/link';

export function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-2">
            {i > 0 ? <span>/</span> : null}
            <Link href={item.href} className="hover:text-brand-600">{item.label}</Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
