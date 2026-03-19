import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import { getEnv } from '../../lib/env.js';
import { generateAndStoreArticle } from '../../lib/articles.js';
import { getPool } from '../../lib/db.js';
import { TOPICS } from '../../lib/topics.js';

function isAuthorized(req: VercelRequest): boolean {
  const provided = req.headers['x-agent-secret'];

  if (!provided || Array.isArray(provided)) return false;

  const expected = getEnv().ARTICLE_AGENT_SECRET;

  return (
    provided.length === expected.length &&
    timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
  );
}

async function pickUniqueTopic() {
  const pool = getPool();

  const used = await pool.query(
    `SELECT DISTINCT source_topic FROM articles`
  );

  const usedSet = new Set(
    used.rows.map((r: any) => r.source_topic)
  );

  const unused = TOPICS.filter(t => !usedSet.has(t.topic));

  // 🔥 если есть неиспользованные → берём их
  if (unused.length > 0) {
    return unused[Math.floor(Math.random() * unused.length)];
  }

  // 🔥 если все использованы → начинаем заново (НО можно улучшить позже)
  return TOPICS[Math.floor(Math.random() * TOPICS.length)];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const selected = await pickUniqueTopic();

    const article = await generateAndStoreArticle({
      topic: selected.topic,
      publish: true
    });

    res.status(200).json({
      success: true,
      topic: selected.topic,
      cluster: selected.cluster,
      slug: article.slug,
      url: `${getEnv().SITE_URL}/blog/${article.slug}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate article' });
  }
}
