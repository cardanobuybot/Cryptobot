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
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
      const safeHref = String(href);
      const isExternal = /^https?:\/\//i.test(safeHref);
      return isExternal
        ? `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${label}</a>`
        : `<a href="${safeHref}">${label}</a>`;
    });
}

function renderMarkdown(md: string): string {
  const codeBlocks: string[] = [];

  let text = md.replace(/```([\w-]*)\n?([\s\S]*?)```/g, (_, _lang, code) => {
    const placeholder = `@@CODEBLOCK_${codeBlocks.length}@@`;
    codeBlocks.push(`<pre><code>${escapeHtml(String(code).trim())}</code></pre>`);
    return placeholder;
  });

  const lines = text.split(/\r?\n/);
  const html: string[] = [];
  let inList = false;
  let paragraphBuffer: string[] = [];

  function flushParagraph() {
    if (paragraphBuffer.length > 0) {
      html.push(`<p>${paragraphBuffer.join('<br/>')}</p>`);
      paragraphBuffer = [];
    }
  }

  function closeList() {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }

    const codeMatch = line.match(/^@@CODEBLOCK_(\d+)@@$/);
    if (codeMatch) {
      flushParagraph();
      closeList();
      html.push(codeBlocks[Number(codeMatch[1])] ?? '');
      continue;
    }

    if (line.startsWith('### ')) {
      flushParagraph();
      closeList();
      html.push(`<h3>${renderInlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      closeList();
      html.push(`<h2>${renderInlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith('# ')) {
      flushParagraph();
      closeList();
      html.push(`<h1>${renderInlineMarkdown(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      flushParagraph();
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${renderInlineMarkdown(line.slice(2))}</li>`);
      continue;
    }

    closeList();
    paragraphBuffer.push(renderInlineMarkdown(line));
  }

  flushParagraph();
  closeList();

  return html.join('\n');
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
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: input.seoTitle ?? input.title,
  description: input.seoDescription ?? input.title,
  image: 'https://www.cryptobot.ltd/cryptobot.jpg',
  author: {
    '@type': 'Organization',
    name: 'Crypto Bot'
  },
  publisher: {
    '@type': 'Organization',
    name: 'Crypto Bot',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.cryptobot.ltd/cryptobot.jpg'
    }
  },
  datePublished: input.publishedAt,
  dateModified: input.publishedAt,
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': url
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

<style>
  .article-shell { padding: 44px 0 70px; }
  .article-wrap { width: min(900px, 92%); margin: 0 auto; }
  .article-card {
    border: 1px solid rgba(145, 168, 222, 0.2);
    background: rgba(22, 32, 57, 0.72);
    border-radius: 18px;
    padding: 28px;
    box-shadow: 0 18px 45px rgba(0, 8, 30, 0.45);
  }
  .article-meta {
    color: #9fb2d8;
    margin: 14px 0 22px;
    font-size: 14px;
  }
  .article-content {
    color: #eaf4ff;
    line-height: 1.8;
  }
  .article-content h2,
  .article-content h3 {
    margin-top: 28px;
    margin-bottom: 12px;
  }
  .article-content p {
    margin: 0 0 18px;
  }
  .article-content ul {
    margin: 0 0 18px 20px;
  }
  .article-content li {
    margin-bottom: 8px;
  }
  .article-content a {
    color: #2dd4ff;
    text-decoration: underline;
  }
  .article-content pre {
    overflow-x: auto;
    padding: 14px;
    border-radius: 12px;
    background: rgba(5, 10, 20, 0.7);
    margin: 0 0 18px;
  }
  .related-articles {
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid rgba(145, 168, 222, 0.2);
  }
  .related-articles h2 {
    margin-bottom: 14px;
  }
  .related-articles ul {
    margin: 0;
    padding-left: 20px;
  }
  .related-articles li {
    margin-bottom: 10px;
  }
  .related-articles a {
    color: #2dd4ff;
    text-decoration: underline;
  }
</style>

${schema}
</head>

<body>

<header class="site-header">
  <div class="container header-content">
    <a class="logo" href="/">
      <img src="https://www.cryptobot.ltd/cryptobot.jpg" alt="Crypto Bot Logo">
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
      res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(
        renderPage({
          title: 'Not found',
          seoTitle: 'Article not found — Crypto Bot',
          seoDescription: 'Requested article was not found.',
          body: '<h1>Not found</h1><p>The requested article could not be found.</p>'
        })
      );
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

    const relatedHtml = related.length
      ? `
        <section class="related-articles">
          <h2>Related Articles</h2>
          <ul>
            ${related
              .map(
                (r) =>
                  `<li><a href="/blog/${escapeHtml(r.slug)}">${escapeHtml(r.title)}</a></li>`
              )
              .join('')}
          </ul>
        </section>
      `
      : '';

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

    res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8');
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
    res.status(500).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(
      renderPage({
        title: 'Server error',
        seoTitle: 'Server error — Crypto Bot',
        seoDescription: 'Unable to load article.',
        body: '<h1>Server error</h1><p>Something went wrong while loading this article.</p>'
      })
    );
  }
}
