import { Connection, PublicKey } from "@solana/web3.js";

export async function detectOperator(
  agent: PublicKey,
  connection: Connection
): Promise<{ address: string; domain: string | null } | null> {
  try {
    const signatures = await connection.getSignaturesForAddress(agent, { limit: 1 });
    if (signatures.length === 0) return null;

    // Oldest transaction — get it by fetching limit=1 from the end
    const oldest = await connection.getSignaturesForAddress(agent, { limit: 1 });

    const sig = oldest[oldest.length - 1]?.signature;
    if (!sig) return null;

    const tx = await connection.getParsedTransaction(sig, {
      maxSupportedTransactionVersion: 0,
    });

    const feePayer = tx?.transaction.message.accountKeys[0]?.pubkey;
    if (!feePayer) return null;

    // Don't report self as operator
    if (feePayer.equals(agent)) return null;

    return { address: feePayer.toBase58(), domain: null };
  } catch {
    return null;
  }
}
