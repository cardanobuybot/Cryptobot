import { getPool } from './db.js';
import { generateArticle } from './openai.js';
import { generateUniqueSlug } from './slug.js';

export type ArticleStatus = 'draft' | 'published';

export type StoredArticle = {
  id: number;
  slug: string;
  status: ArticleStatus;
  title: string;
};

export async function generateAndStoreArticle(input: {
  topic: string;
  publish?: boolean;
}): Promise<StoredArticle> {
  const topic = input.topic.trim();
  if (!topic) {
    throw new Error('Topic is required');
  }

  const generated = await generateArticle(topic);
  const slug = await generateUniqueSlug(generated.title);
  const status: ArticleStatus = input.publish ? 'published' : 'draft';

  const pool = getPool();
  const result = await pool.query<StoredArticle>(
    `INSERT INTO articles (
      slug, title, excerpt, content, status, seo_title, seo_description, source_topic, published_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING id, slug, status, title`,
    [
      slug,
      generated.title,
      generated.excerpt,
      generated.content,
      status,
      generated.seoTitle,
      generated.seoDescription,
      topic,
      status === 'published' ? new Date() : null
    ]
  );

  const article = result.rows[0];
  if (!article) {
    throw new Error('Failed to store article');
  }

  return article;
}
