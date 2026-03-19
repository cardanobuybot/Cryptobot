import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getArticleBySlug, getSmartRelatedArticles } from '../../lib/articles.js';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getSlug(req: VercelRequest): string {
  const value = req.query.slug;
  if (Array.isArray(value)) return value[0] ?? '';
  return typeof value === 'string' ? value : '';
}

function renderInlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function renderMarkdown(md: string): string {
  const lines = md.split(/\r?\n/);
  return lines.map(line => `<p>${renderInlineMarkdown(line)}</p>`).join('');
}

function renderPage(input: {
  title: string;
  body: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
}): string {
  const url = input.slug
    ? `https://www.cryptobot.ltd/blog/${input.slug}`
    : 'https://www.cryptobot.ltd/blog';

  const schema = input.slug
    ? `<script type="application/ld+json">
${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: input.seoTitle ?? input.title,
  description: input.seoDescription ?? input.title,
  image: "https://www.cryptobot.ltd/cryptobot.jpg",
  author: {
    "@type": "Organization",
    name: "Crypto Bot"
  },
  publisher: {
    "@type": "Organization",
    name: "Crypto Bot",
    logo: {
      "@type": "ImageObject",
      url: "https://www.cryptobot.ltd/cryptobot.jpg"
    }
  },
  datePublished: input.publishedAt,
  dateModified: input.publishedAt,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": url
  }
})}
</script>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>${escapeHtml(input.seoTitle ?? input.title)}</title>

<meta name="description" content="${escapeHtml(input.seoDescription ?? input.title)}">
<meta name="robots" content="index,follow">

<link rel="canonical" href="${url}">

<meta property="og:title" content="${escapeHtml(input.seoTitle ?? input.title)}">
<meta property="og:description" content="${escapeHtml(input.seoDescription ?? input.title)}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="article">
<meta property="og:image" content="https://www.cryptobot.ltd/cryptobot.jpg">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(input.seoTitle ?? input.title)}">
<meta name="twitter:description" content="${escapeHtml(input.seoDescription ?? input.title)}">
<meta name="twitter:image" content="https://www.cryptobot.ltd/cryptobot.jpg">

<link rel="stylesheet" href="https://www.cryptobot.ltd/styles.css">

${schema}
</head>

<body>

<header class="site-header">
  <div class="container header-content">
    <a class="logo" href="/">
      <img src="https://www.cryptobot.ltd/cryptobot.jpg">
      <span>Crypto Bot</span>
    </a>
    <nav class="quick-nav">
      <a href="/">Home</a>
      <a href="/blog">Blog</a>
      <a href="/contact.html">Contact</a>
    </nav>
  </div>
</header>

<main class="article-shell">
  <div class="article-wrap">
    <article class="article-card">
      ${input.body}
    </article>
  </div>
</main>

<footer>
  <div class="container">
    <p>© 2026 Crypto Bot Ltd</p>
  </div>
</footer>

</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = getSlug(req);

  try {
    const article = await getArticleBySlug(slug);

    if (!article) {
      res.status(404).send('Not found');
      return;
    }

    const related = await getSmartRelatedArticles(
      article.id,
      article.title,
      article.source_topic ?? null
    );

    const createdAtFull =
      article.created_at instanceof Date
        ? article.created_at.toISOString()
        : new Date(String(article.created_at)).toISOString();

    const createdAtDisplay = new Date(createdAtFull).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    const relatedHtml = `
      <div style="margin-top:40px">
        <h2>Related Articles</h2>
        <ul>
          ${related.map(r =>
            `<li><a href="/blog/${r.slug}">${r.title}</a></li>`
          ).join('')}
        </ul>
      </div>
    `;

    const body = `
      <p><a href="/">Home</a> / <a href="/blog">Blog</a></p>

      <h1>${escapeHtml(article.title)}</h1>

      <div class="article-meta">
        <span>
          Published:
          <time datetime="${createdAtFull}">
            ${escapeHtml(createdAtDisplay)}
          </time>
        </span>
      </div>

      <div class="article-content">
        ${renderMarkdown(article.content)}
      </div>

      ${relatedHtml}
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(
      renderPage({
        title: article.title,
        slug: article.slug,
        seoTitle: `${article.title} — Crypto Bot`,
        seoDescription: article.title,
        publishedAt: createdAtFull,
        body
      })
    );
  } catch (e) {
    console.error(e);
    res.status(500).send('Server error');
  }
}
