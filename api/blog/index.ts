import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../../lib/db.js';

type BlogListItem = {
  slug: string;
  title: string;
  excerpt: string | null;
  created_at: Date | string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPage(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog — Crypto Bot</title>
  <meta name="description" content="Crypto Bot blog about TON, Telegram bots, and crypto payments">
  <meta name="robots" content="index,follow">
  <link rel="stylesheet" href="https://cryptobot.ltd/styles.css">
  <style>
    .blog-shell { padding: 44px 0 70px; }
    .blog-wrap { width: min(980px, 92%); margin: 0 auto; }
    .blog-card {
      border: 1px solid rgba(145, 168, 222, 0.2);
      background: rgba(22, 32, 57, 0.72);
      border-radius: 18px;
      padding: 28px;
      box-shadow: 0 18px 45px rgba(0, 8, 30, 0.45);
    }
    .blog-list {
      display: grid;
      gap: 18px;
      margin-top: 24px;
    }
    .blog-item {
      border: 1px solid rgba(145, 168, 222, 0.16);
      border-radius: 14px;
      padding: 18px;
      background: rgba(11, 20, 39, 0.45);
    }
    .blog-item h2 {
      margin: 0 0 10px;
      font-size: 24px;
      line-height: 1.3;
    }
    .blog-item a {
      color: #eaf4ff;
      text-decoration: none;
    }
    .blog-item a:hover {
      text-decoration: underline;
    }
    .blog-meta {
      color: #9fb2d8;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .blog-excerpt {
      color: #dbe7fb;
      line-height: 1.7;
    }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="container header-content">
      <a class="logo" href="/">
        <img src="https://cryptobot.ltd/cryptobot.jpg" alt="Crypto Bot Logo">
        <span>Crypto Bot</span>
      </a>
      <nav class="quick-nav">
        <a href="/">Home</a>
        <a href="/blog">Blog</a>
        <a href="/ai-articles.html">AI Admin</a>
        <a href="/contact.html">Contact</a>
      </nav>
    </div>
  </header>

  <main class="blog-shell">
    <div class="blog-wrap">
      <section class="blog-card">
        ${body}
      </section>
    </div>
  </main>

  <footer>
    <div class="container footer-grid">
      <p>© 2026 Crypto Bot Ltd.</p>
      <div class="footer-links">
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

  try {
    const pool = getPool();
    const result = await pool.query<BlogListItem>(
      `SELECT slug, title, excerpt, created_at
       FROM articles
       WHERE status = 'published'
       ORDER BY created_at DESC
       LIMIT 100`
    );

    const articles = result.rows;

    const body = articles.length
      ? `
        <p class="breadcrumbs"><a href="/">Home</a> / Blog</p>
        <h1>Crypto Bot Blog</h1>
        <p style="color:#9fb2d8;">Guides, tutorials, and insights about TON, Telegram bots, and crypto payments.</p>
        <div class="blog-list">
          ${articles
            .map((article) => {
              const createdAt =
                article.created_at instanceof Date
                  ? article.created_at.toISOString().slice(0, 10)
                  : String(article.created_at).slice(0, 10);

              return `
                <article class="blog-item">
                  <h2>
                    <a href="/blog/${escapeHtml(article.slug)}">${escapeHtml(article.title)}</a>
                  </h2>
                  <div class="blog-meta">Published: ${escapeHtml(createdAt)}</div>
                  <div class="blog-excerpt">${escapeHtml(article.excerpt ?? '')}</div>
                </article>
              `;
            })
            .join('')}
        </div>
      `
      : `
        <p class="breadcrumbs"><a href="/">Home</a> / Blog</p>
        <h1>Crypto Bot Blog</h1>
        <p style="color:#9fb2d8;">No published articles yet.</p>
      `;

    res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderPage(body));
  } catch (error) {
    console.error('Failed to load blog index', error);
    res.status(500).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send('<h1>Server error</h1><p>Unable to load blog index.</p>');
  }
}
