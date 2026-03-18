import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import { getEnv } from '../../lib/env.js';
import { generateAndStoreArticle } from '../../lib/articles.js';

const DEFAULT_TOPIC = 'How businesses can safely accept crypto payments';

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
    const article = await generateAndStoreArticle({ topic: DEFAULT_TOPIC, publish: false });
    res.status(200).json(article);
  } catch (error) {
    console.error('Failed to run article job', error);
    res.status(500).json({ error: 'Failed to run article job' });
  }
}
