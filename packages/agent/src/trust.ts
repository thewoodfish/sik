import { Connection, PublicKey } from "@solana/web3.js";
import type { AgentTrustBreakdown } from "./types";

export async function computeAgentTrust(
  agent: PublicKey,
  connection: Connection
): Promise<{
  score: number;
  breakdown: AgentTrustBreakdown;
  registeredAt: number;
  lastActive: number;
}> {
  let signatures: Awaited<ReturnType<typeof connection.getSignaturesForAddress>>;
  try {
    signatures = await connection.getSignaturesForAddress(agent, { limit: 1000 });
  } catch {
    signatures = [];
  }

  if (signatures.length === 0) {
    return {
      score: 0,
      breakdown: { operatorReputation: 0, transactionConsistency: 0, authorizationDepth: 0, programSpecialization: 0 },
      registeredAt: 0,
      lastActive: 0,
    };
  }

  const sorted = signatures
    .filter((s) => s.blockTime)
    .sort((a, b) => (a.blockTime ?? 0) - (b.blockTime ?? 0));

  const registeredAt = sorted[0]?.blockTime ?? 0;
  const lastActive = sorted[sorted.length - 1]?.blockTime ?? 0;

  const consistency = scoreConsistency(sorted);
  const specialization = scoreSpecialization(signatures.length);

  const breakdown: AgentTrustBreakdown = {
    operatorReputation: 0,
    transactionConsistency: consistency,
    authorizationDepth: 0,
    programSpecialization: specialization,
  };

  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { score, breakdown, registeredAt, lastActive };
}

function scoreConsistency(signatures: { blockTime?: number | null }[]): number {
  if (signatures.length < 2) return 0;
  const gaps: number[] = [];
  for (let i = 1; i < signatures.length; i++) {
    gaps.push((signatures[i]!.blockTime ?? 0) - (signatures[i - 1]!.blockTime ?? 0));
  }
  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variance = gaps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / gaps.length;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 1;
  return Math.min(25, Math.max(0, Math.round(25 * (1 - Math.min(cv, 1)))));
}

function scoreSpecialization(txCount: number): number {
  // More transactions = more active = higher trust for an agent
  if (txCount >= 100) return 20;
  if (txCount >= 30) return 15;
  if (txCount >= 10) return 10;
  if (txCount >= 3) return 5;
  return 0;
}
