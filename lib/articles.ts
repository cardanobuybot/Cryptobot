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
    'your', 'using', 'used', 'best', 'are', 'can', 'you', 'via', 'why',
    'ton', 'crypto', 'telegram', 'bot', 'bots', 'guide', 'beginner', 'beginners'
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

function pickAnchorCandidates(title: string): string[] {
  const tokens = tokenize(title);
  const phrases: string[] = [];

  if (tokens.length >= 3) {
    phrases.push(tokens.slice(0, 3).join(' '));
  }
  if (tokens.length >= 2) {
    phrases.push(tokens.slice(0, 2).join(' '));
  }
  if (tokens.length >= 1) {
    phrases.push(tokens[0]);
  }

  return Array.from(new Set(phrases.filter((v) => v.length >= 4)));
}

function splitMarkdownIntoSafeBlocks(content: string): string[] {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.filter(Boolean);
}

function isCodeBlock(block: string): boolean {
  return block.startsWith('```') && block.endsWith('```');
}

function isHeadingLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('# ');
}

function isSubheadingLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('## ') || trimmed.startsWith('### ');
}

function alreadyHasMarkdownLink(line: string): boolean {
  return /\[[^\]]+\]\([^)]+\)/.test(line);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function linkOnePhraseInParagraph(paragraph: string, articles: RelatedArticle[]): { text: string; inserted: number } {
  let result = paragraph;
  let inserted = 0;

  for (const article of articles) {
    if (inserted >= 3) {
      break;
    }

    const candidates = pickAnchorCandidates(article.title);

    for (const candidate of candidates) {
      const markdownLink = `[${candidate}](/blog/${article.slug})`;

      if (result.includes(markdownLink)) {
        continue;
      }

      const regex = new RegExp(`\\b(${escapeRegExp(candidate)})\\b`, 'i');

      if (!regex.test(result)) {
        continue;
      }

      result = result.replace(regex, markdownLink);
      inserted += 1;
      break;
    }
  }

  return { text: result, inserted };
}

function injectInternalLinks(content: string, articles: RelatedArticle[]): string {
  if (!articles.length) {
    return content;
  }

  const blocks = splitMarkdownIntoSafeBlocks(content);
  let totalInserted = 0;

  const processed = blocks.map((block) => {
    if (isCodeBlock(block) || totalInserted >= 3) {
      return block;
    }

    const lines = block.split(/\r?\n/);
    const updatedLines = lines.map((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        return line;
      }

      if (isHeadingLine(line) || isSubheadingLine(line)) {
        return line;
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return line;
      }

      if (alreadyHasMarkdownLink(line)) {
        return line;
      }

      if (totalInserted >= 3) {
        return line;
      }

      const linked = linkOnePhraseInParagraph(line, articles);
      totalInserted += linked.inserted;
      return linked.text;
    });

    return updatedLines.join('\n');
  });

  return processed.join('');
}

function ensureTonScannerLink(content: string): string {
  if (content.toLowerCase().includes('tonscanner.io')) {
    return content;
  }

  return `${content}

## Explore TON data

You can explore transactions, wallets, and analytics using [TONScanner](https://tonscanner.io).`;
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

  const strongMatches = ranked
    .filter((item) => item.score > 0)
    .slice(0, 3)
    .map((item) => item.article);

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

  let contentWithLinks = generated.content;

  contentWithLinks = injectInternalLinks(contentWithLinks, relatedForContent);
  contentWithLinks = ensureTonScannerLink(contentWithLinks);
  contentWithLinks += buildRelatedReadingMarkdown(relatedForContent);

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
