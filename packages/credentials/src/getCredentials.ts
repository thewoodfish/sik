import { Connection, PublicKey } from "@solana/web3.js";
import { getAttestationDecoder, SOLANA_ATTESTATION_SERVICE_PROGRAM_ADDRESS } from "sas-lib";
import { mapAttestation } from "./mapAttestation";
import type { SIKCredential } from "./types";

export async function getCredentials(owner: PublicKey, connection: Connection): Promise<SIKCredential[]> {
  let accounts: Awaited<ReturnType<typeof connection.getProgramAccounts>>;

  try {
    // nonce is at byte offset 1 (after 1-byte discriminator) — 32 bytes
    accounts = await connection.getProgramAccounts(
      new PublicKey(SOLANA_ATTESTATION_SERVICE_PROGRAM_ADDRESS),
      {
        filters: [{ memcmp: { offset: 1, bytes: owner.toBase58() } }],
      }
    );
  } catch {
    return [];
  }

  if (!accounts || accounts.length === 0) return [];

  const decoder = getAttestationDecoder();

  const results = await Promise.allSettled(
    accounts.map(({ pubkey, account }) => {
      const attestation = decoder.decode(new Uint8Array(account.data as Buffer));
      return mapAttestation(pubkey.toBase58(), attestation, connection);
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<SIKCredential> => r.status === "fulfilled")
    .map(r => r.value);
}
