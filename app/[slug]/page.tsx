import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CTAButton } from '@/components/CTAButton';
import { FAQBlock } from '@/components/FAQBlock';
import { ProsCons } from '@/components/ProsCons';
import { RelatedContent } from '@/components/RelatedContent';
import { TOC } from '@/components/TOC';
import { seoPages } from '@/data/seo-pages';
import { buildMetadata } from '@/lib/seo';

export async function generateStaticParams() {
  return seoPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = seoPages.find((p) => p.slug === slug);
  if (!page) return {};
  return buildMetadata(page.title, page.description, `/${page.slug}`);
}

export default async function SeoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = seoPages.find((p) => p.slug === slug);
  if (!page) notFound();

  return (
    <article className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: page.h1, href: `/${page.slug}` }]} />
        <header className="space-y-4">
          <h1 className="text-4xl font-bold">{page.h1}</h1>
          <p className="text-lg text-slate-600">{page.intro}</p>
          <CTAButton slug={page.ctaSlug} sourcePage={`/${page.slug}`} label="Open Offer" />
        </header>

        <ProsCons pros={page.pros} cons={page.cons} />

        <section className="prose-content">
          {page.sections.map((section) => {
            const id = section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return (
              <div key={section.heading} id={id}>
                <h2>{section.heading}</h2>
                {section.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            );
          })}
        </section>

        {page.type === 'comparison' ? (
          <section className="prose-content">
            <h2>Quick comparison table</h2>
            <table>
              <thead><tr><th>Criteria</th><th>CryptoBot</th><th>Alternative</th></tr></thead>
              <tbody>
                <tr><td>Onboarding speed</td><td>Fast in Telegram</td><td>Varies</td></tr>
                <tr><td>Ease of use</td><td>Beginner-friendly</td><td>Depends on app</td></tr>
                <tr><td>Payment tools</td><td>Built-in</td><td>Varies</td></tr>
              </tbody>
            </table>
          </section>
        ) : null}

        <FAQBlock faq={page.faq} />
        <RelatedContent slugs={page.related} />
      </div>
      <TOC sections={page.sections} />
    </article>
  );
}
