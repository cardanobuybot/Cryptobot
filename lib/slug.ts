import { getPool } from './db.js';

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'article';
}

export async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = toSlug(title);
  const pool = getPool();

  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    const result = await pool.query<{ id: string }>(
      'SELECT id FROM articles WHERE slug = $1 LIMIT 1',
      [candidate]
    );

    if (result.rows.length === 0) {
      return candidate;
    }

    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}
