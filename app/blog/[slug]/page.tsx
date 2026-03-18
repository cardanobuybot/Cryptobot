import { getArticleBySlug } from '../../../lib/articles';

export default async function Page({
  params
}: {
  params: { slug: string };
}) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return <div>Not found</div>;
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>{article.title}</h1>
      <p>Status: {article.status}</p>
      <p>Created: {String(article.created_at).slice(0, 10)}</p>
      <div style={{ whiteSpace: 'pre-wrap' }}>
        {article.content}
      </div>
    </main>
  );
}
