import { Connection, PublicKey } from "@solana/web3.js";
import {
  getCredentialDecoder,
  getSchemaDecoder,
  deserializeAttestationData,
} from "sas-lib";
import type { Attestation } from "sas-lib";
import type { SIKCredential } from "./types";

export async function mapAttestation(
  address: string,
  attestation: Attestation,
  connection: Connection
): Promise<SIKCredential> {
  const now = Math.floor(Date.now() / 1000);
  const credDecoder = getCredentialDecoder();
  const schemaDecoder = getSchemaDecoder();
  const td = new TextDecoder();

  const [credInfo, schemaInfo] = await Promise.all([
    connection.getAccountInfo(new PublicKey(attestation.credential)).catch(() => null),
    connection.getAccountInfo(new PublicKey(attestation.schema)).catch(() => null),
  ]);

  const credential = credInfo ? credDecoder.decode(new Uint8Array(credInfo.data as Buffer)) : null;
  const schema = schemaInfo ? schemaDecoder.decode(new Uint8Array(schemaInfo.data as Buffer)) : null;

  let data: Record<string, unknown> = {};
  if (schema) {
    try {
      data = deserializeAttestationData(schema, attestation.data as Uint8Array) as Record<string, unknown>;
    } catch {
      data = { raw: Buffer.from(attestation.data).toString("hex") };
    }
  }

  const expiry = attestation.expiry ? Number(attestation.expiry) : null;
  const expiresAt = expiry && expiry > 0 ? expiry : null;

  return {
    id: address,

    issuer: {
      address: credential ? String(credential.authority) : "unknown",
      credentialPda: String(attestation.credential),
      name: null,
    },

    schema: {
      pda: String(attestation.schema),
      name: schema ? td.decode(schema.name as Uint8Array) : "unknown",
    },

    issuedAt: 0,
    expiresAt,
    expired: expiresAt !== null && now > expiresAt,

    data,
  };
}
