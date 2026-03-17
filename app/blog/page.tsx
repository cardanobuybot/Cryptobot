import type { Metadata } from "next";
import { getPublishedArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Blog | Crypto Bot",
  description: "Crypto Bot blog with guides on crypto trading bots and automation.",
};

export default async function BlogPage() {
  const articles = await getPublishedArticles();

  return (
    <main className="container">
      <h1>Blog</h1>
      <div className="cards">
        {articles.map((article) => (
          <article key={article.id} className="card">
            <h2><a href={`/blog/${article.slug}`}>{article.title}</a></h2>
            <p>{article.excerpt}</p>
            <small>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Draft"}</small>
          </article>
        ))}
        {articles.length === 0 && <p>No published articles yet.</p>}
      </div>
    </main>
  );
}
