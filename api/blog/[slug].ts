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
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return typeof value === 'string' ? value : '';
}

function renderInlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
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
  let inParagraph = false;

  function closeList() {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  }

  function closeParagraph() {
    if (inParagraph) {
      html.push('</p>');
      inParagraph = false;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      closeParagraph();
      closeList();
      continue;
    }

    const codeMatch = line.match(/^@@CODEBLOCK_(\d+)@@$/);
    if (codeMatch) {
      closeParagraph();
      closeList();
      html.push(codeBlocks[Number(codeMatch[1])] ?? '');
      continue;
    }

    if (line.startsWith('### ')) {
      closeParagraph();
      closeList();
      html.push(`<h3>${renderInlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith('## ')) {
      closeParagraph();
      closeList();
      html.push(`<h2>${renderInlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith('# ')) {
      closeParagraph();
      closeList();
      html.push(`<h1>${renderInlineMarkdown(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      closeParagraph();
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${renderInlineMarkdown(line.slice(2))}</li>`);
      continue;
    }

    if (!inParagraph) {
      closeList();
      html.push('<p>');
      inParagraph = true;
    } else {
      html.push('<br/>');
    }

    html.push(renderInlineMarkdown(line));
  }

  closeParagraph();
  closeList();

  return html.join('');
}

function renderPage(input: {
  title: string;
  body: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
}): string {
  const canonicalUrl = input.slug
    ? `https://www.cryptobot.ltd/blog/${input.slug}`
    : 'https://www.cryptobot.ltd/blog';

  const schema = input.slug
    ? `
  <script type="application/ld+json">
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
    datePublished: input.publishedAt ?? new Date().toISOString(),
    dateModified: input.publishedAt ?? new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
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

  <link rel="canonical" href="${canonicalUrl}">

  <meta property="og:title" content="${escapeHtml(input.seoTitle ?? input.title)}">
  <meta property="og:description" content="${escapeHtml(input.seoDescription ?? input.title)}">
  <meta property="og:url" content="${canonicalUrl}">
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
      <p>© 2026 Crypto Bot Ltd. All rights reserved.</p>
      <div class="footer-links">
        <a href="/about.html">About</a>
        <a href="/contact.html">Contact</a>
        <a href="/privacy.html">Privacy</a>
        <a href="/terms.html">Terms</a>
        <a href="/legal.html">Legal</a>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).send('Method not allowed');
    return;
  }

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

    const createdAt =
      article.created_at instanceof Date
        ? article.created_at.toISOString().slice(0, 10)
        : String(article.created_at).slice(0, 10);

    const publishedAt =
      article.created_at instanceof Date
        ? article.created_at.toISOString()
        : new Date(String(article.created_at)).toISOString();

    const relatedHtml = related.length
      ? `
        <section class="related-articles">
          <h2>Related Articles</h2>
          <ul>
            ${related
              .map(
                (item) =>
                  `<li><a href="/blog/${escapeHtml(item.slug)}">${escapeHtml(item.title)}</a></li>`
              )
              .join('')}
          </ul>
        </section>
      `
      : '';

    const body = `
      <p><a href="/">Home</a> / <a href="/blog">Blog</a> / ${escapeHtml(article.slug)}</p>
      <h1>${escapeHtml(article.title)}</h1>
      <div class="article-meta">
        <span>Status: ${escapeHtml(article.status)}</span>
        <span>Created: ${escapeHtml(createdAt)}</span>
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
        publishedAt,
        body
      })
    );
  } catch (error) {
    console.error('Failed to load article', error);

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
