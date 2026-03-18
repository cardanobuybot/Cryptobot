import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pool = getPool();

  const result = await pool.query(`
    SELECT slug, created_at
    FROM articles
    WHERE status = 'published'
  `);

  const urls = result.rows.map(a => {
    const lastmod = new Date(a.created_at).toISOString();
    return `
      <url>
        <loc>https://cryptobot.ltd/blog/${a.slug}</loc>
        <lastmod>${lastmod}</lastmod>
      </url>
    `;
  }).join('');

  res.setHeader('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>https://cryptobot.ltd/blog</loc>
  </url>

  ${urls}

</urlset>`);
}
