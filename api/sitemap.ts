import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../lib/db.js';

type ArticleRow = {
  slug: string;
  updated_at?: Date | string | null;
  created_at?: Date | string | null;
};

const BASE_URL = 'https://www.cryptobot.ltd';

function formatDate(value?: Date | string | null): string {
  if (!value) {
    return new Date().toISOString().split('T')[0];
  }

  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().split('T')[0];
  }

  return parsed.toISOString().split('T')[0];
}

function buildUrlXml(input: {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}): string {
  return `
  <url>
    <loc>${input.loc}</loc>
    <lastmod>${input.lastmod}</lastmod>
    <changefreq>${input.changefreq}</changefreq>
    <priority>${input.priority}</priority>
  </url>`;
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const pool = getPool();

    const result = await pool.query<ArticleRow>(`
      SELECT slug, updated_at, created_at
      FROM articles
      WHERE status = 'published'
      ORDER BY created_at DESC
    `);

    const articles = result.rows;
    const today = new Date().toISOString().split('T')[0];

    const staticPages = [
      {
        loc: `${BASE_URL}/`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '1.0'
      },
      {
        loc: `${BASE_URL}/blog`,
        lastmod: today,
        changefreq: 'daily',
        priority: '0.9'
      },
      {
        loc: `${BASE_URL}/wallet.html`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.9'
      },
      {
        loc: `${BASE_URL}/p2p.html`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.9'
      },
      {
        loc: `${BASE_URL}/exchange.html`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.9'
      },
      {
        loc: `${BASE_URL}/crypto-pay.html`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.9'
      },
      {
        loc: `${BASE_URL}/fees.html`,
        lastmod: today,
        changefreq: 'monthly',
        priority: '0.7'
      },
      {
        loc: `${BASE_URL}/security.html`,
        lastmod: today,
        changefreq: 'monthly',
        priority: '0.7'
      },
      {
        loc: `${BASE_URL}/about.html`,
        lastmod: today,
        changefreq: 'monthly',
        priority: '0.6'
      },
      {
        loc: `${BASE_URL}/contact.html`,
        lastmod: today,
        changefreq: 'monthly',
        priority: '0.6'
      },
      {
        loc: `${BASE_URL}/privacy.html`,
        lastmod: today,
        changefreq: 'yearly',
        priority: '0.4'
      },
      {
        loc: `${BASE_URL}/terms.html`,
        lastmod: today,
        changefreq: 'yearly',
        priority: '0.4'
      },
      {
        loc: `${BASE_URL}/legal.html`,
        lastmod: today,
        changefreq: 'yearly',
        priority: '0.4'
      }
    ];

    const articleUrls = articles
      .map((a) =>
        buildUrlXml({
          loc: `${BASE_URL}/blog/${a.slug}`,
          lastmod: formatDate(a.updated_at || a.created_at),
          changefreq: 'weekly',
          priority: '0.8'
        })
      )
      .join('');

    const staticUrls = staticPages.map(buildUrlXml).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${articleUrls}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Error generating sitemap');
  }
}
