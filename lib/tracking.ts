import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export type ClickEvent = {
  id: string;
  slug: string;
  timestamp: string;
  sourcePage: string;
  referer: string;
  userAgent: string;
  ipHash: string;
  country: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
};

const DATA_DIR = path.join(process.cwd(), 'data');
const CLICKS_FILE = path.join(DATA_DIR, 'click-events.ndjson');

function hashIp(ip: string): string {
  if (!ip) return '';
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 24);
}

export async function logClick(event: Omit<ClickEvent, 'id' | 'timestamp' | 'ipHash'> & { ip: string }) {
  const record: ClickEvent = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ipHash: hashIp(event.ip),
    slug: event.slug,
    sourcePage: event.sourcePage,
    referer: event.referer,
    userAgent: event.userAgent,
    country: event.country,
    utm_source: event.utm_source,
    utm_medium: event.utm_medium,
    utm_campaign: event.utm_campaign
  };

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(CLICKS_FILE, `${JSON.stringify(record)}\n`, 'utf8');
}
