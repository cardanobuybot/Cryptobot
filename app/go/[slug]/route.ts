import { NextRequest, NextResponse } from 'next/server';
import { getAffiliateBySlug } from '@/data/affiliate-links';
import { logClick } from '@/lib/tracking';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getAffiliateBySlug(slug);
  if (!item) {
    return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
  }

  const search = request.nextUrl.searchParams;
  const finalUrl = new URL(item.destinationUrl);
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach((key) => {
    const value = search.get(key);
    if (value) finalUrl.searchParams.set(key, value);
  });

  const sourcePage = search.get('src') || '';
  await logClick({
    slug,
    sourcePage,
    referer: request.headers.get('referer') || '',
    userAgent: request.headers.get('user-agent') || '',
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
    country: request.headers.get('x-vercel-ip-country') || '',
    utm_source: search.get('utm_source') || '',
    utm_medium: search.get('utm_medium') || '',
    utm_campaign: search.get('utm_campaign') || ''
  });

  return NextResponse.redirect(finalUrl, { status: 302 });
}
