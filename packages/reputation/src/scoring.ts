import { ConfirmedSignatureInfo } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import type { ParsedTokenAccountsByOwner } from "./types-internal";

// System program and SPL Token program — too ubiquitous to signal diversity
const NOISE_PROGRAMS = new Set([
  "11111111111111111111111111111111",
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf8Ss623VQ5DA",
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe8bv",
  "ComputeBudget111111111111111111111111111111",
]);

const GOVERNANCE_PROGRAMS = new Set([
  "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw", // SPL Governance
  "GovernanceProgram11111111111111111111111111111",
  "hgovkRU6Ghe1Qoyb54HdSLdqN7VtxaifBzRmh9ixgnx", // Realms
]);

export function scoreAccountAge(signatures: ConfirmedSignatureInfo[]): number {
  if (signatures.length === 0) return 0;
  const oldest = signatures[signatures.length - 1];
  if (!oldest?.blockTime) return 0;
  const ageInDays = (Date.now() / 1000 - oldest.blockTime) / 86400;
  return Math.min(20, Math.floor((ageInDays / 365) * 20));
}

export function scoreTransactionVolume(count: number): number {
  if (count === 0) return 0;
  // log10 scale: 500+ txns = 20 pts
  return Math.min(20, Math.floor(Math.log10(count + 1) * 8.68));
}

export function scoreProgramDiversity(signatures: ConfirmedSignatureInfo[]): number {
  // signatures only carry the memo; program diversity needs transaction details.
  // We approximate using the memo field and count unique non-null memos,
  // but a deeper scan would require getTransaction per sig (too slow).
  // Instead: treat signature count brackets as a proxy — this is documented
  // in SIK-1.md as a known approximation for the hackathon build.
  const unique = new Set(
    signatures
      .map((s) => s.memo)
      .filter((m): m is string => m !== null && m !== undefined)
  );
  const diversityProxy = Math.min(signatures.length, unique.size + Math.floor(signatures.length / 10));
  return Math.min(20, diversityProxy);
}

export function scoreProgramDiversityFromPrograms(programIds: string[]): number {
  const filtered = programIds.filter((id) => !NOISE_PROGRAMS.has(id));
  const unique = new Set(filtered);
  return Math.min(20, unique.size);
}

export function scoreDaoParticipation(signatures: ConfirmedSignatureInfo[]): number {
  // Check memos for governance-related markers (best-effort without full tx fetch)
  const governanceInteractions = signatures.filter(
    (s) => s.memo && GOVERNANCE_PROGRAMS.has(s.memo.trim())
  ).length;
  return Math.min(20, governanceInteractions * 5);
}

export function scoreSolBalance(lamports: number): number {
  const sol = lamports / LAMPORTS_PER_SOL;
  // 1 point per 0.1 SOL, max 10 — so 1 SOL = 10 pts, 0.1 SOL = 1 pt
  return Math.min(10, Math.floor(sol * 10));
}

export function scoreNftHoldings(tokenAccounts: ParsedTokenAccountsByOwner): number {
  const nfts = tokenAccounts.value.filter((account) => {
    const info = account.account.data.parsed?.info?.tokenAmount;
    return info && info.uiAmount === 1 && info.decimals === 0;
  });
  return Math.min(10, nfts.length);
}
