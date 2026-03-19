import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const pool = getPool();

    const result = await pool.query(`
      SELECT slug, updated_at, created_at
      FROM articles
      WHERE status = 'published'
      ORDER BY created_at DESC
    `);

    const articles = result.rows;

    const urls = articles.map(a => {
      const date = (a.updated_at || a.created_at || new Date())
        .toISOString()
        .split('T')[0];

      return `
  <url>
    <loc>https://www.cryptobot.ltd/blog/${a.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.cryptobot.ltd/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.cryptobot.ltd/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${urls}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xml);

  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Error generating sitemap');
  }
}
