import { AffiliateLink } from '@/lib/types';

export const affiliateLinks: AffiliateLink[] = [
  {
    id: '1',
    slug: 'cryptobot',
    partnerName: 'Crypto Bot',
    destinationUrl: 'https://bit.ly/4jo0oou',
    active: true,
    category: 'wallet',
    notes: 'Primary referral flow preserved from legacy homepage.'
  },
  {
    id: '2',
    slug: 'cryptobot-p2p',
    partnerName: 'Crypto Bot P2P',
    destinationUrl: 'https://bit.ly/433gVIG',
    active: true,
    category: 'exchange'
  },
  {
    id: '3',
    slug: 'cryptobot-exchange',
    partnerName: 'Crypto Bot Exchange',
    destinationUrl: 'https://bit.ly/4cP84h2',
    active: true,
    category: 'exchange'
  },
  {
    id: '4',
    slug: 'youtube',
    partnerName: 'Crypto Bot YouTube',
    destinationUrl: 'https://youtube.com/@cryptobotltd',
    active: true,
    category: 'social'
  },
  {
    id: '5',
    slug: 'twitter',
    partnerName: 'Crypto Bot X',
    destinationUrl: 'https://x.com/CryptoBotLtd',
    active: true,
    category: 'social'
  }
];

export function getAffiliateBySlug(slug: string) {
  return affiliateLinks.find((item) => item.slug === slug && item.active);
}
