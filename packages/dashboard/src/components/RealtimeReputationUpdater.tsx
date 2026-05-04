"use client";

import { useEffect, useRef, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { computeReputation, type ReputationBreakdown } from "@sik/reputation";
import { ReputationBreakdownChart } from "@/components/ReputationBreakdownChart";

interface Props {
  owner: string;
  initialScore: number;
  initialBreakdown: ReputationBreakdown;
}

export function RealtimeReputationUpdater({ owner, initialScore, initialBreakdown }: Props) {
  const { connection } = useConnection();
  const [score, setScore] = useState(initialScore);
  const [breakdown, setBreakdown] = useState<ReputationBreakdown>(initialBreakdown);
  const [justUpdated, setJustUpdated] = useState(false);
  const subscriptionIdRef = useRef<number | null>(null);
  const updatedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const pubkey = new PublicKey(owner);

    subscriptionIdRef.current = connection.onAccountChange(pubkey, async () => {
      try {
        const result = await computeReputation(pubkey, connection);
        const newScore =
          result.accountAge +
          result.transactionVolume +
          result.programDiversity +
          result.daoParticipation +
          result.solBalance +
          result.nftHoldings;
        setScore(newScore);
        setBreakdown(result);
        setJustUpdated(true);
        if (updatedTimerRef.current) clearTimeout(updatedTimerRef.current);
        updatedTimerRef.current = setTimeout(() => setJustUpdated(false), 3000);
      } catch {
        // Silently ignore transient RPC errors — next update will retry
      }
    });

    return () => {
      if (subscriptionIdRef.current !== null) {
        connection.removeAccountChangeListener(subscriptionIdRef.current);
      }
      if (updatedTimerRef.current) clearTimeout(updatedTimerRef.current);
    };
  }, [owner, connection]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <LiveBadge />
        {justUpdated && (
          <span className="text-xs text-brand-green animate-pulse">Updated just now</span>
        )}
      </div>
      <ReputationBreakdownChart score={score} breakdown={breakdown} />
    </div>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green" />
      </span>
      Live
    </span>
  );
}
