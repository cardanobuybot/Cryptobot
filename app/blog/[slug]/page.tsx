import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { blogPosts } from '@/data/blog-posts';
import { buildMetadata } from '@/lib/seo';
import { CTAButton } from '@/components/CTAButton';
import { RelatedContent } from '@/components/RelatedContent';

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return buildMetadata(post.title, post.description, `/blog/${post.slug}`);
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <article className="space-y-6">
      <h1 className="text-4xl font-bold">{post.title}</h1>
      <p className="text-sm text-slate-500">Published: {post.publishedAt} · {post.readingTime}</p>
      <div className="prose-content">
        {post.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      <CTAButton slug="cryptobot" sourcePage={`/blog/${post.slug}`} label="Try CryptoBot" />
      <RelatedContent slugs={post.relatedSlugs} />
    </article>
  );
}
