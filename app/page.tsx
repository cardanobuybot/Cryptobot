import Link from 'next/link';
import { AffiliateDisclosure } from '@/components/AffiliateDisclosure';
import { CTAButton } from '@/components/CTAButton';

const featuredPages = [
  'cryptobot-review',
  'how-to-use-cryptobot',
  'cryptobot-fees',
  'is-cryptobot-safe',
  'cryptobot-vs-trust-wallet',
  'cryptobot-in-europe'
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-gradient-to-r from-brand-600 to-brand-500 p-8 text-white">
        <h1 className="text-4xl font-bold">CryptoBot Europe SEO Hub</h1>
        <p className="mt-4 max-w-3xl text-lg">Useful guides, comparisons and country pages for Telegram crypto users across Europe.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <CTAButton slug="cryptobot" sourcePage="/" label="Start with CryptoBot" className="bg-white text-brand-600 hover:bg-slate-100" />
          <CTAButton slug="cryptobot-p2p" sourcePage="/" label="Open P2P Market" className="border border-white bg-transparent hover:bg-white hover:text-brand-600" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Featured pages</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPages.map((slug) => (
            <Link key={slug} href={`/${slug}`} className="rounded-xl bg-white p-4 shadow-sm hover:shadow">
              <h3 className="font-semibold capitalize">{slug.replaceAll('-', ' ')}</h3>
              <p className="mt-2 text-sm text-slate-600">Read the complete guide</p>
            </Link>
          ))}
        </div>
      </section>

      <AffiliateDisclosure />
    </div>
  );
}
