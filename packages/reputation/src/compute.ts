import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { ReputationBreakdown } from "./types";
import {
  scoreAccountAge,
  scoreTransactionVolume,
  scoreProgramDiversity,
  scoreDaoParticipation,
  scoreSolBalance,
  scoreNftHoldings,
} from "./scoring";

/**
 * Compute the SIK reputation breakdown for a wallet address.
 *
 * All data is sourced from public on-chain state via the provided RPC
 * connection. Results are fully reproducible by anyone with access to a node.
 *
 * @param owner   The wallet PublicKey to score
 * @param connection  An active Solana web3.js Connection
 */
export async function computeReputation(
  owner: PublicKey,
  connection: Connection
): Promise<ReputationBreakdown> {
  const [signaturesResult, balanceResult, tokenAccountsResult] =
    await Promise.allSettled([
      connection.getSignaturesForAddress(owner, { limit: 1000 }),
      connection.getBalance(owner),
      connection.getParsedTokenAccountsByOwner(owner, {
        programId: TOKEN_PROGRAM_ID,
      }),
    ]);

  const signatures =
    signaturesResult.status === "fulfilled" ? signaturesResult.value : [];
  const balance =
    balanceResult.status === "fulfilled" ? balanceResult.value : 0;
  const tokenAccounts =
    tokenAccountsResult.status === "fulfilled"
      ? tokenAccountsResult.value
      : { value: [] };

  return {
    accountAge: scoreAccountAge(signatures),
    transactionVolume: scoreTransactionVolume(signatures.length),
    programDiversity: scoreProgramDiversity(signatures),
    daoParticipation: scoreDaoParticipation(signatures),
    solBalance: scoreSolBalance(balance),
    nftHoldings: scoreNftHoldings(tokenAccounts as Parameters<typeof scoreNftHoldings>[0]),
  };
}
