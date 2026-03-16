import Link from 'next/link';

type Props = {
  slug: string;
  sourcePage: string;
  label?: string;
  className?: string;
};

export function CTAButton({ slug, sourcePage, label = 'Open Offer', className = '' }: Props) {
  return (
    <Link
      href={`/go/${slug}?src=${encodeURIComponent(sourcePage)}`}
      className={`inline-flex rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-500 ${className}`}
    >
      {label}
    </Link>
  );
}
