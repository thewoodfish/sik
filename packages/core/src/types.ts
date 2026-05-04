export type { ReputationBreakdown } from "@sik/reputation";
export type { SIKCredential } from "@sik/credentials";

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

  credentials: import("@sik/credentials").SIKCredential[];

  fetchedAt: number;
}

export interface GetIdentityOptions {
  /** Enable in-memory caching (default: true) */
  cache?: boolean;
  /** Cache TTL in milliseconds (default: 3_600_000 — 1 hour) */
  cacheTTL?: number;
}
