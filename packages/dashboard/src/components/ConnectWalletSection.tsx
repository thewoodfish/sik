"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useDomainsForOwner } from "@bonfida/sns-react";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (m) => m.WalletMultiButton
    ),
  { ssr: false }
);

export function ConnectWalletSection() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { data: domains } = useDomainsForOwner(connection, publicKey ?? undefined);

  return (
    <div className="flex items-center gap-3">
      {publicKey && domains && domains.length > 0 && (
        <Link
          href="/dashboard"
          className="text-sm text-brand-purple hover:text-purple-400 transition-colors"
        >
          My Identity
        </Link>
      )}
      <WalletMultiButton />
    </div>
  );
}
