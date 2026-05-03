import { Connection, PublicKey } from "@solana/web3.js";
import { computeReputation } from "@sik/reputation";
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

  const breakdown = await computeReputation(new PublicKey(owner), connection);
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
    credentials: [],
    fetchedAt: Date.now(),
  };

  if (cache) {
    identityCache.set(cacheKey, identity, cacheTTL);
  }

  return identity;
}
