import type { Metadata } from "next";
import "../styles.css";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Crypto Bot",
  description: "Crypto Bot website",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
