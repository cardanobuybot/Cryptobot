import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getArticleBySlug } from '../../lib/articles';

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

function renderPage(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="robots" content="noindex,nofollow">
  <link rel="stylesheet" href="https://cryptobot.ltd/styles.css">
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
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin: 12px 0 20px;
    }
    .article-content {
      white-space: pre-wrap;
      color: #eaf4ff;
      line-height: 1.75;
    }
  </style>
</head>
<body>
  <header class="site-header"><div class="container header-content"><a class="logo" href="/"><img src="https://cryptobot.ltd/cryptobot.jpg" alt="Crypto Bot Logo"><span>Crypto Bot</span></a><nav class="quick-nav"><a href="/">Home</a><a href="/ai-articles.html">AI Admin</a><a href="/contact.html">Contact</a></nav></div></header>
  <main class="article-shell"><div class="article-wrap"><article class="article-card">${body}</article></div></main>
  <footer><div class="container footer-grid"><p>© 2026 Crypto Bot Ltd.</p><div class="footer-links"><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/legal.html">Legal</a></div></div></footer>
</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (req.method !== 'GET') {
      res.status(405).send('Method not allowed');
      return;
    }

    const slug = getSlug(req);
    const article = await getArticleBySlug(slug);

    if (!article) {
      res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(renderPage('Article not found', '<h1>Article not found</h1>'));
      return;
    }

    const createdAt = article.created_at instanceof Date
      ? article.created_at.toISOString().slice(0, 10)
      : String(article.created_at).slice(0, 10);

    res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(
      renderPage(
        `${escapeHtml(article.title)} — Crypto Bot`,
        `
          <p class="breadcrumbs"><a href="/">Home</a> / Blog / ${escapeHtml(article.slug)}</p>
          <h1>${escapeHtml(article.title)}</h1>
          <div class="article-meta">
            <span>Status: ${escapeHtml(article.status)}</span>
            <span>Created: ${escapeHtml(createdAt)}</span>
          </div>
          <div class="article-content">${escapeHtml(article.content)}</div>
        `
      )
    );
  } catch (error) {
    console.error(error);
    res.status(500).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderPage('Server error', '<h1>Server error</h1>'));
  }
}
