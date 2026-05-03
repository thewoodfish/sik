"use client";

// Prevent static prerendering — this page requires wallet context at runtime
export const dynamic = "force-dynamic";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useDomainsForOwner } from "@bonfida/sns-react";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import { ProfileEditor } from "@/components/ProfileEditor";

const WalletMultiButton = nextDynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { data: domains, isLoading } = useDomainsForOwner(
    connection,
    publicKey ?? undefined
  );

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-brand-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-brand-purple font-bold text-xl">SIK</span>
          <span className="text-gray-500 text-sm">Identity Dashboard</span>
        </Link>
        <WalletMultiButton />
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        {!publicKey ? (
          <div className="text-center space-y-6 py-24">
            <h1 className="text-3xl font-bold">Connect your wallet</h1>
            <p className="text-gray-400">
              Connect a Solana wallet to manage your .sol identity.
            </p>
            <WalletMultiButton />
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse bg-brand-card rounded-xl h-24" />
            <div className="animate-pulse bg-brand-card rounded-xl h-24 opacity-60" />
          </div>
        ) : !domains || domains.length === 0 ? (
          <div className="text-center space-y-4 py-24">
            <h1 className="text-2xl font-bold text-gray-300">No .sol names found</h1>
            <p className="text-gray-500 text-sm">
              This wallet doesn&apos;t own any SNS domains.{" "}
              <a
                href="https://naming.bonfida.org"
                target="_blank"
                rel="noreferrer"
                className="text-brand-purple hover:underline"
              >
                Register one on Bonfida
              </a>
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <h1 className="text-2xl font-bold">Your Identities</h1>
            <div className="space-y-4">
              {domains.map(({ domain }: { domain: string; pubkey: unknown }) => (
                <DomainRow key={domain} domain={`${domain}.sol`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function DomainRow({ domain }: { domain: string }) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="font-bold text-lg text-brand-purple">{domain}</p>
        <p className="text-gray-500 text-sm">SNS domain</p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={`/${domain}`}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          View identity →
        </Link>
        <ProfileEditor domain={domain} />
      </div>
    </div>
  );
}
