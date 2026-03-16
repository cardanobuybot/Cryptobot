import { MetadataRoute } from 'next';
import { seoPages } from '@/data/seo-pages';
import { blogPosts } from '@/data/blog-posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://cryptobot.ltd';
  const now = new Date();
  const staticRoutes = ['', ...seoPages.map((p) => p.slug), ...blogPosts.map((p) => `blog/${p.slug}`)];

  return staticRoutes.map((path) => ({
    url: `${base}/${path}`.replace(/\/$/, '/'),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.8
  }));
}
