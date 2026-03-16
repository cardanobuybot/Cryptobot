export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingTime: string;
  body: string[];
  relatedSlugs: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'best-telegram-crypto-tools-2026',
    title: 'Best Telegram Crypto Tools in 2026: What to Use and Why',
    description: 'Educational overview of Telegram-native crypto tools for European users.',
    publishedAt: '2026-03-16',
    readingTime: '7 min',
    body: [
      'Telegram-native finance tools are growing because users want lower friction and faster execution.',
      'For affiliate SEO, trust and usefulness come first: compare options, explain limitations, and provide practical context.'
    ],
    relatedSlugs: ['cryptobot-review', 'how-to-use-cryptobot']
  }
];

export const getBlogBySlug = (slug: string) => blogPosts.find((post) => post.slug === slug);
