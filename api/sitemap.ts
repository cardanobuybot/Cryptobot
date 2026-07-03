import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE_URL = 'https://www.cryptobot.ltd';

function url(loc: string, changefreq: string, priority: string, lastmod: string): string {
  return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const today = new Date().toISOString().split('T')[0];

  const pages = [
    url(`${BASE_URL}/`,           'weekly',  '1.0', today),
    url(`${BASE_URL}/wallet`,     'weekly',  '0.9', today),
    url(`${BASE_URL}/p2p`,        'weekly',  '0.9', today),
    url(`${BASE_URL}/exchange`,   'weekly',  '0.9', today),
    url(`${BASE_URL}/crypto-pay`, 'weekly',  '0.9', today),
    url(`${BASE_URL}/fees`,       'monthly', '0.7', today),
    url(`${BASE_URL}/security`,   'monthly', '0.7', today),
    url(`${BASE_URL}/about`,      'monthly', '0.6', today),
    url(`${BASE_URL}/contact`,    'monthly', '0.6', today),
    url(`${BASE_URL}/privacy`,    'yearly',  '0.4', today),
    url(`${BASE_URL}/terms`,      'yearly',  '0.4', today),
    url(`${BASE_URL}/legal`,      'yearly',  '0.4', today),
  ].join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(xml);
}
