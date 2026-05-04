import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Connection } from "@solana/web3.js";
import { getIdentity } from "@sik/core";
import { IdentityCard } from "@/components/IdentityCard";
import { RealtimeReputationUpdater } from "@/components/RealtimeReputationUpdater";
import { CredentialList } from "@/components/CredentialList";

interface PageProps {
  params: { domain: string };
}

async function fetchIdentity(domain: string) {
  const rpc =
    process.env["NEXT_PUBLIC_RPC_URL"] ??
    "https://api.mainnet-beta.solana.com";
  const connection = new Connection(rpc, "confirmed");
  return getIdentity(domain, connection, { cache: false });
}

export default async function DomainPage({ params }: PageProps) {
  const domain = decodeURIComponent(params.domain);

  if (!domain.endsWith(".sol")) notFound();

  let identity;
  try {
    identity = await fetchIdentity(domain);
  } catch {
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-2xl font-bold text-gray-300">{domain}</p>
            <p className="text-gray-500">
              This domain is not registered on SNS, or could not be resolved.
            </p>
            <Link href="/" className="text-brand-purple hover:underline text-sm">
              ← Back to search
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-8">
        <Suspense fallback={<div className="animate-pulse bg-brand-card rounded-xl h-48" />}>
          <IdentityCard identity={identity} />
        </Suspense>

        <RealtimeReputationUpdater
          owner={identity.owner}
          initialScore={identity.reputation.score}
          initialBreakdown={identity.reputation.breakdown}
        />

        <CredentialList credentials={identity.credentials} />

        <div className="text-center text-xs text-gray-600">
          Fetched at {new Date(identity.fetchedAt).toUTCString()} · Data from
          Solana mainnet
        </div>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="border-b border-brand-border px-6 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3">
        <span className="text-brand-purple font-bold text-xl">SIK</span>
        <span className="text-gray-500 text-sm">Solana Identity Kit</span>
      </Link>
      <Link
        href="/demo/dao-gate"
        className="text-sm text-gray-400 hover:text-brand-purple transition-colors"
      >
        DAO Gate demo →
      </Link>
    </header>
  );
}

export function generateMetadata({ params }: PageProps) {
  return {
    title: `${decodeURIComponent(params.domain)} · SIK`,
    description: `On-chain identity for ${decodeURIComponent(params.domain)} — profile, reputation score, and credentials.`,
  };
}
