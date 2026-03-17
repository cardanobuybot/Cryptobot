import { getPool } from "@/lib/db";

export type ArticleStatus = "draft" | "published";

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  status: ArticleStatus;
  tags: string[] | null;
  seoTitle: string | null;
  seoDescription: string | null;
  sourceTopic: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface NewArticleInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string | null;
  status: ArticleStatus;
  tags?: string[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  sourceTopic: string;
  publishedAt?: string | null;
}

function mapRow(row: any): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverImageUrl: row.cover_image_url,
    status: row.status,
    tags: row.tags,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    sourceTopic: row.source_topic,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    publishedAt: row.published_at ? row.published_at.toISOString() : null,
  };
}

export async function createArticle(input: NewArticleInput): Promise<Article> {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO articles
      (slug, title, excerpt, content, cover_image_url, status, tags, seo_title, seo_description, source_topic, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      input.slug,
      input.title,
      input.excerpt,
      input.content,
      input.coverImageUrl ?? null,
      input.status,
      input.tags ?? null,
      input.seoTitle ?? null,
      input.seoDescription ?? null,
      input.sourceTopic,
      input.publishedAt ?? null,
    ]
  );
  return mapRow(result.rows[0]);
}

export async function getPublishedArticles(): Promise<Article[]> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT * FROM articles WHERE status = 'published' ORDER BY published_at DESC NULLS LAST, created_at DESC`
  );
  return result.rows.map(mapRow);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const pool = getPool();
  const result = await pool.query(`SELECT * FROM articles WHERE slug = $1 LIMIT 1`, [slug]);
  if (!result.rowCount) return null;
  return mapRow(result.rows[0]);
}

export async function articleSlugExists(slug: string): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query(`SELECT 1 FROM articles WHERE slug = $1 LIMIT 1`, [slug]);
  return result.rowCount > 0;
}
