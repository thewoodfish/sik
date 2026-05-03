import { resolve, getRecordV2, Record } from "@bonfida/spl-name-service";
import { Connection } from "@solana/web3.js";
import type { SIKIdentity } from "./types";

/** Strip the .sol suffix if present so callers can pass either form. */
function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/\.sol$/, "");
}

async function fetchRecord(
  connection: Connection,
  domain: string,
  record: Record
): Promise<string | null> {
  try {
    const result = await getRecordV2(connection, domain, record);
    if (!result) return null;
    // stale flag on record data — do not serve stale identity
    if ("stale" in result && result.stale) return null;
    return result.deserializedContent ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve a .sol domain to its owner address and SNS Records V2 profile.
 * Returns null for the owner if the domain does not exist.
 */
export async function resolveIdentity(
  domain: string,
  connection: Connection
): Promise<Pick<SIKIdentity, "domain" | "owner" | "profile">> {
  const normalized = normalizeDomain(domain);
  const displayDomain = normalized + ".sol";

  const ownerPubkey = await resolve(connection, normalized);
  const owner = ownerPubkey.toBase58();

  const [avatar, twitter, github, discord, telegram, url, email, backpack] =
    await Promise.allSettled([
      fetchRecord(connection, normalized, Record.Pic),
      fetchRecord(connection, normalized, Record.Twitter),
      fetchRecord(connection, normalized, Record.Github),
      fetchRecord(connection, normalized, Record.Discord),
      fetchRecord(connection, normalized, Record.Telegram),
      fetchRecord(connection, normalized, Record.Url),
      fetchRecord(connection, normalized, Record.Email),
      fetchRecord(connection, normalized, Record.Backpack),
    ]);

  const settled = <T>(r: PromiseSettledResult<T>): T | null =>
    r.status === "fulfilled" ? r.value : null;

  return {
    domain: displayDomain,
    owner,
    profile: {
      avatar: settled(avatar),
      twitter: settled(twitter),
      github: settled(github),
      discord: settled(discord),
      telegram: settled(telegram),
      url: settled(url),
      email: settled(email),
      backpack: settled(backpack),
    },
  };
}
