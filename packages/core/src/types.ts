export type { ReputationBreakdown } from "@sik/reputation";

export interface SIKIdentity {
  /** The .sol domain name */
  domain: string;
  /** Owner wallet address (base58) */
  owner: string;

  profile: {
    avatar: string | null;
    twitter: string | null;
    github: string | null;
    discord: string | null;
    telegram: string | null;
    url: string | null;
    email: string | null;
    backpack: string | null;
  };

  reputation: {
    score: number;
    breakdown: import("@sik/reputation").ReputationBreakdown;
    computedAt: number;
  };

  /** Always [] in SIK-1; populated in SIK-2 */
  credentials: Credential[];

  fetchedAt: number;
}

/** Stub type — fully implemented in SIK-2 */
export interface Credential {
  id: string;
  issuer: string;
  type: string;
  issuedAt: number;
  data: Record<string, unknown>;
}

export interface GetIdentityOptions {
  /** Enable in-memory caching (default: true) */
  cache?: boolean;
  /** Cache TTL in milliseconds (default: 3_600_000 — 1 hour) */
  cacheTTL?: number;
}
