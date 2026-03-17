export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <div className="container header-content">
          <a className="logo" href="https://cryptobot.ltd/" aria-label="Crypto Bot home">
            <img src="https://cryptobot.ltd/cryptobot.jpg" alt="Crypto Bot Logo" />
            <span>Crypto Bot</span>
          </a>
          <nav className="quick-nav" aria-label="Main">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="/blog">Blog</a>
            <a href="/internal/ai-articles">Internal</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="container hero-inner">
            <p className="eyebrow">Telegram-native crypto platform</p>
            <h1>Trade, pay, and manage crypto at <span>light speed</span>.</h1>
            <p className="hero-copy">Crypto Bot combines wallet, P2P market, exchange, checks, and payments into one seamless Telegram experience.</p>
            <div className="hero-actions">
              <a href="https://bit.ly/4jo0oou" className="btn btn-primary">Start Trading</a>
              <a href="/p2p.html" className="btn btn-ghost">Explore P2P</a>
              <a href="/exchange.html" className="btn btn-ghost">Explore Exchange</a>
            </div>
          </div>
        </section>

        <section className="features" id="features">
          <div className="container">
            <div className="section-title">
              <h2>Everything you need in one interface</h2>
              <p>Deep product pages and guides help you choose the best workflow for your crypto tasks.</p>
            </div>
            <div className="feature-grid">
              <article className="feature-card"><div className="feature-icon">💼</div><h3><a href="/wallet.html">Unified Wallet</a></h3><p>Store and track your balances from a single Telegram-native wallet.</p></article>
              <article className="feature-card"><div className="feature-icon">💸</div><h3><a href="/p2p.html">P2P Marketplace</a></h3><p>Buy and sell with flexible payment methods and clear pricing.</p></article>
              <article className="feature-card"><div className="feature-icon">📈</div><h3><a href="/exchange.html">Smart Exchange</a></h3><p>Use market and limit orders with fast execution and transparent rates.</p></article>
              <article className="feature-card"><div className="feature-icon">🧾</div><h3><a href="/crypto-pay.html">Crypto Payments</a></h3><p>Create invoices and accept payments for stores and creators.</p></article>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-grid">
          <p>© 2026 Crypto Bot Ltd. All rights reserved.</p>
          <div className="footer-links">
            <a href="/about.html">About</a>
            <a href="/contact.html">Contact</a>
            <a href="/privacy.html">Privacy</a>
            <a href="/terms.html">Terms</a>
          </div>
        </div>
      </footer>
    </>
  );
}
