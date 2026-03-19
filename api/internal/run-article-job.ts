import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import { getEnv } from '../../lib/env.js';
import { generateAndStoreArticle } from '../../lib/articles.js';

const TOPICS = [
  'How businesses can safely accept crypto payments',
  'How to accept TON payments using Telegram bots',
  'How TON blockchain payments work for online businesses',
  'How to create a TON wallet and receive payments',
  'TON payments vs traditional crypto payments',
  'How Telegram bots can accept TON payments',
  'Best ways for creators to accept TON payments',
  'How to use TON for digital product payments',
  'How small businesses can accept TON payments in 2026',
  'How to integrate TON payments into a website or Telegram bot'
];

function isAuthorized(req: VercelRequest): boolean {
  const providedHeader = req.headers['x-agent-secret'];
  const provided = Array.isArray(providedHeader) ? providedHeader[0] : providedHeader;

  if (!provided) {
    return false;
  }

  const expected = getEnv().ARTICLE_AGENT_SECRET;
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

function pickTopic(): string {
  const index = Math.floor(Math.random() * TOPICS.length);
  return TOPICS[index] ?? 'How businesses can safely accept crypto payments';
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const selectedTopic = pickTopic();

    const article = await generateAndStoreArticle({
      topic: selectedTopic,
      publish: true
    });

    res.status(200).json({
      success: true,
      topic: selectedTopic,
      id: article.id,
      slug: article.slug,
      status: article.status,
      title: article.title,
      url: `${getEnv().SITE_URL}/blog/${article.slug}`
    });
  } catch (error) {
    console.error('run-article-job failed', error);
    res.status(500).json({ error: 'Failed to generate article' });
  }
}
