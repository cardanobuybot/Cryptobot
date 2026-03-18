import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import { getEnv } from '../../lib/env.js';
import { generateAndStoreArticle } from '../../lib/articles.js';

type Body = {
  topic?: unknown;
  publish?: unknown;
};

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

function parseBody(body: unknown): Body {
  if (!body) {
    return {};
  }

  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as Body;
    } catch {
      return {};
    }
  }

  if (typeof body === 'object') {
    return body as Body;
  }

  return {};
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

  const body = parseBody(req.body);
  const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
  const publish = body.publish === true;

  if (!topic) {
    res.status(400).json({ error: 'topic is required' });
    return;
  }

  try {
    const article = await generateAndStoreArticle({ topic, publish });
    res.status(200).json(article);
  } catch (error) {
    console.error('Failed to generate article', error);
    res.status(500).json({ error: 'Failed to generate article' });
  }
}
