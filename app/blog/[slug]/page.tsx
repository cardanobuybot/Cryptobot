export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticleBySlug } from "@/lib/articles";
import { markdownToSafeHtml } from "@/lib/markdown";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: "Article not found" };

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article || article.status !== "published") notFound();

  const html = markdownToSafeHtml(article.content);

  return (
    <main className="container article">
      <h1>{article.title}</h1>
      <p className="meta">Published {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "-"}</p>
      <article dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
