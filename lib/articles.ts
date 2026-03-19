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

export type BlogArticle = {
  id: number;
  slug: string;
  title: string;
  content: string;
  status: ArticleStatus;
  created_at: Date | string;
  source_topic?: string | null;
};

export type RelatedArticle = {
  id: number;
  slug: string;
  title: string;
  source_topic?: string | null;
};

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ');
}

function tokenize(value: string): string[] {
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'from', 'into', 'that', 'this', 'how', 'what',
    'your', 'using', 'used', 'best', 'into', 'are', 'can', 'you', 'via', 'why',
    'ton', 'crypto', 'telegram', 'bot', 'bots'
  ]);

  return Array.from(
    new Set(
      normalizeText(value)
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 2 && !stopWords.has(t))
    )
  );
}

function scoreSimilarity(a: string, b: string): number {
  const aTokens = tokenize(a);
  const bTokens = tokenize(b);

  if (!aTokens.length || !bTokens.length) {
    return 0;
  }

  const bSet = new Set(bTokens);
  let score = 0;

  for (const token of aTokens) {
    if (bSet.has(token)) {
      score += 1;
    }
  }

  return score;
}

function buildRelatedReadingMarkdown(articles: RelatedArticle[]): string {
  if (!articles.length) {
    return '';
  }

  const links = articles
    .map((article) => `- [${article.title}](/blog/${article.slug})`)
    .join('\n');

  return `

## Related reading

${links}
`;
}

export async function getArticleBySlug(slug: string): Promise<BlogArticle | null> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return null;
  }

  const pool = getPool();
  const result = await pool.query<BlogArticle>(
    `SELECT id, slug, title, content, status, created_at, source_topic
     FROM articles
     WHERE slug = $1
       AND status = 'published'
     LIMIT 1`,
    [normalizedSlug]
  );

  return result.rows[0] ?? null;
}

export async function getSmartRelatedArticles(
  currentId: number,
  currentTitle: string,
  sourceTopic?: string | null
): Promise<RelatedArticle[]> {
  const pool = getPool();

  const result = await pool.query<RelatedArticle>(
    `SELECT id, slug, title, source_topic
     FROM articles
     WHERE id != $1
       AND status = 'published'
     ORDER BY created_at DESC
     LIMIT 30`,
    [currentId]
  );

  const basis = `${currentTitle} ${sourceTopic ?? ''}`.trim();

  const ranked = result.rows
    .map((article) => {
      const candidateBasis = `${article.title} ${article.source_topic ?? ''}`.trim();
      const score = scoreSimilarity(basis, candidateBasis);
      return { article, score };
    })
    .sort((a, b) => b.score - a.score);

  const strongMatches = ranked.filter((item) => item.score > 0).slice(0, 3).map((item) => item.article);

  if (strongMatches.length > 0) {
    return strongMatches;
  }

  return result.rows.slice(0, 3);
}

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

  const existingResult = await pool.query<RelatedArticle>(
    `SELECT id, slug, title, source_topic
     FROM articles
     WHERE status = 'published'
     ORDER BY created_at DESC
     LIMIT 30`
  );

  const rankedExisting = existingResult.rows
    .map((article) => {
      const candidateBasis = `${article.title} ${article.source_topic ?? ''}`.trim();
      const score = scoreSimilarity(topic, candidateBasis);
      return { article, score };
    })
    .sort((a, b) => b.score - a.score);

  const relatedForContent = rankedExisting
    .filter((item) => item.score > 0)
    .slice(0, 3)
    .map((item) => item.article);

  const contentWithLinks =
    generated.content + buildRelatedReadingMarkdown(relatedForContent);

  const result = await pool.query<StoredArticle>(
    `INSERT INTO articles (
      slug,
      title,
      excerpt,
      content,
      status,
      seo_title,
      seo_description,
      source_topic,
      published_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING id, slug, status, title`,
    [
      slug,
      generated.title,
      generated.excerpt,
      contentWithLinks,
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
