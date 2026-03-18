import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../../lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pool = getPool();

  const result = await pool.query(`
    SELECT slug, title, created_at
    FROM articles
    WHERE status = 'published'
    ORDER BY created_at DESC
    LIMIT 50
  `);

  const articles = result.rows;

  const list = articles.map(a => `
    <li>
      <a href="/blog/${a.slug}">
        ${a.title}
      </a>
      <small>${String(a.created_at).slice(0,10)}</small>
    </li>
  `).join('');

  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <h1>Blog</h1>
    <ul>${list}</ul>
  `);
}
