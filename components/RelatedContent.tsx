import Link from 'next/link';

export function RelatedContent({ slugs }: { slugs: string[] }) {
  return (
    <section>
      <h2 className="text-2xl font-bold">Related content</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {slugs.map((slug) => (
          <li key={slug} className="rounded-xl bg-white p-4 shadow-sm">
            <Link href={`/${slug}`} className="font-medium text-brand-600 hover:underline">/{slug}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
