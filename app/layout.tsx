import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Crypto Bot",
  description: "Crypto Bot website",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <a href="/" className="brand">Crypto Bot</a>
          <nav>
            <a href="/blog">Blog</a>
            <a href="/internal/ai-articles">Internal</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
