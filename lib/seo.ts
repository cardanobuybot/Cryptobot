import { Metadata } from 'next';

export const siteUrl = 'https://cryptobot.ltd';

export function buildMetadata(title: string, description: string, path: string): Metadata {
  const url = `${siteUrl}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'CryptoBot Europe'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}
