import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://cryptobot.ltd'),
  title: 'CryptoBot Europe - SEO Affiliate Content Hub',
  description: 'Useful, transparent guides and comparisons for CryptoBot and Telegram crypto tools in Europe.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold text-slate-900">CryptoBot Europe</Link>
            <nav className="flex gap-4 text-sm text-slate-600">
              <Link href="/cryptobot-review">Review</Link>
              <Link href="/how-to-use-cryptobot">How-to</Link>
              <Link href="/cryptobot-in-europe">Europe</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-600">
            © 2026 CryptoBot Europe. Educational content only.
          </div>
        </footer>
      </body>
    </html>
  );
}
