import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/providers/WalletProvider";

export const metadata: Metadata = {
  title: "SIK — Solana Identity Kit",
  description:
    "The identity primitive every Solana app has been rebuilding — now standardised. One function call to resolve any .sol name to its full on-chain identity.",
  openGraph: {
    title: "SIK — Solana Identity Kit",
    description: "Resolve any .sol name to a full on-chain identity in one call.",
    siteName: "SIK",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
