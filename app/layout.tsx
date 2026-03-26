import type { Metadata } from "next";
import { Cormorant_Garamond, Instrument_Sans } from "next/font/google";

import { SolanaProvider } from "@/components/providers/SolanaProvider";

import "./globals.css";

const bodyFont = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nft.solarkbot.xyz"),
  title: "SolarkBot Photo Atelier",
  description:
    "A cinematic 3D studio where the SolarkBot artist turns your prompt into artwork you can download or mint on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-bg)]">
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
