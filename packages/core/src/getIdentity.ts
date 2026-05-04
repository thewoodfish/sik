import { Connection, PublicKey } from "@solana/web3.js";
import { computeReputation } from "@sik/reputation";
import { getCredentials } from "@sik/credentials";
import type { SIKIdentity, GetIdentityOptions } from "./types";
import { resolveIdentity } from "./resolve";
import { identityCache } from "./cache";

const DEFAULT_TTL = 3_600_000; // 1 hour

/**
 * Resolve a .sol domain to its full SIK identity — profile, reputation, and
 * (stubbed) credentials — with a single function call.
 *
 * @param domain      The .sol domain name (with or without the .sol suffix)
 * @param connection  An active Solana web3.js Connection
 * @param options     Cache and TTL configuration
 */
export async function getIdentity(
  domain: string,
  connection: Connection,
  options: GetIdentityOptions = {}
): Promise<SIKIdentity> {
  const { cache = true, cacheTTL = DEFAULT_TTL } = options;
  const cacheKey = domain.toLowerCase().replace(/\.sol$/, "");

  if (cache) {
    const cached = identityCache.get(cacheKey);
    if (cached) return cached as SIKIdentity;
  }

  const { domain: resolvedDomain, owner, profile } = await resolveIdentity(
    domain,
    connection
  );

  const ownerPubkey = new PublicKey(owner);

  const [reputationResult, credentialsResult] = await Promise.allSettled([
    computeReputation(ownerPubkey, connection),
    getCredentials(ownerPubkey, connection),
  ]);

  const breakdown = reputationResult.status === "fulfilled"
    ? reputationResult.value
    : { accountAge: 0, transactionVolume: 0, programDiversity: 0, daoParticipation: 0, solBalance: 0, nftHoldings: 0 };
  const score = Object.values(breakdown).reduce((sum, v) => sum + v, 0);

  const identity: SIKIdentity = {
    domain: resolvedDomain,
    owner,
    profile,
    reputation: {
      score,
      breakdown,
      computedAt: Date.now(),
    },
    credentials: credentialsResult.status === "fulfilled" ? credentialsResult.value : [],
    fetchedAt: Date.now(),
  };

  if (cache) {
    identityCache.set(cacheKey, identity, cacheTTL);
  }

  return identity;
}
