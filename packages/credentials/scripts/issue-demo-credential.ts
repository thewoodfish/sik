/**
 * Issue a real SAS credential to any wallet address.
 *
 * Usage:
 *   pnpm --filter @sik/credentials issue-demo
 *
 * Env vars (all optional):
 *   KEYPAIR_PATH  — path to keypair JSON (default: ~/.config/solana/id.json)
 *   RECIPIENT     — recipient wallet address (default: issuer = self-attestation)
 *   RPC_URL       — RPC endpoint (default: devnet)
 *
 * Example — mainnet, issue to a specific wallet:
 *   RECIPIENT=<addr> RPC_URL=https://api.mainnet-beta.solana.com \
 *     pnpm --filter @sik/credentials issue-demo
 */

import fs from "fs";
import os from "os";
import path from "path";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  AccountMeta,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  deriveCredentialPda,
  deriveSchemaPda,
  deriveAttestationPda,
  getCreateCredentialInstruction,
  getCreateSchemaInstruction,
  getCreateAttestationInstruction,
  serializeAttestationData,
  type Schema,
} from "sas-lib";
import { address, type Address } from "@solana/kit";

// ─── Config ──────────────────────────────────────────────────────────────────

const RPC_URL = process.env.RPC_URL ?? "https://api.devnet.solana.com";
const KEYPAIR_PATH =
  process.env.KEYPAIR_PATH ??
  path.join(os.homedir(), ".config/solana/id.json");

const CREDENTIAL_NAME = "SIK Hackathon";
const SCHEMA_NAME = "participant";
const SCHEMA_VERSION = 1;
const FIELD_NAMES = ["project", "track", "year"];
const LAYOUT = new Uint8Array([12, 12, 2]); // String, String, u16

const ATTESTATION_DATA = {
  project: "Solana Identity Kit",
  track: "SNS Identity",
  year: 2026,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadKeypair(filePath: string): Keypair {
  if (!fs.existsSync(filePath)) {
    console.error(`Keypair not found at ${filePath}`);
    console.error('Run: solana-keygen new  (or set KEYPAIR_PATH env var)');
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

/**
 * Encode field names into the packed byte format that sas-lib's
 * serializeAttestationData expects: [u32LE(len), ...utf8]* per field.
 */
function encodeFieldNames(names: string[]): Uint8Array {
  const te = new TextEncoder();
  const encoded = names.map((n) => te.encode(n));
  const total = encoded.reduce((s, b) => s + 4 + b.length, 0);
  const buf = new Uint8Array(total);
  let off = 0;
  for (const b of encoded) {
    new DataView(buf.buffer, off, 4).setUint32(0, b.length, true);
    off += 4;
    buf.set(b, off);
    off += b.length;
  }
  return buf;
}

/**
 * Convert a sas-lib / @solana/kit Instruction to a web3.js v1
 * TransactionInstruction so we can use the familiar v1 send helpers.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toV1Instruction(kitIx: any): TransactionInstruction {
  const keys: AccountMeta[] = (kitIx.accounts ?? []).map(
    (acc: { address: string; role: number }) => ({
      pubkey: new PublicKey(acc.address),
      isSigner: (acc.role & 2) !== 0,  // READONLY_SIGNER=2, WRITABLE_SIGNER=3
      isWritable: (acc.role & 1) !== 0, // WRITABLE=1, WRITABLE_SIGNER=3
    })
  );
  return new TransactionInstruction({
    programId: new PublicKey(kitIx.programAddress as string),
    keys,
    data: kitIx.data ? Buffer.from(kitIx.data) : Buffer.alloc(0),
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const keypair = loadKeypair(KEYPAIR_PATH);
  const issuerAddress = address(keypair.publicKey.toBase58());

  const recipient: Address = process.env.RECIPIENT
    ? address(process.env.RECIPIENT)
    : issuerAddress;

  console.log("Issuer:    ", issuerAddress);
  console.log("Recipient: ", recipient);
  console.log("RPC:       ", RPC_URL);
  console.log();

  const connection = new Connection(RPC_URL, "confirmed");

  // ── Derive PDAs ────────────────────────────────────────────────────────────

  const [credentialPda] = await deriveCredentialPda({
    authority: issuerAddress,
    name: CREDENTIAL_NAME,
  });
  const [schemaPda] = await deriveSchemaPda({
    credential: credentialPda,
    name: SCHEMA_NAME,
    version: SCHEMA_VERSION,
  });
  const [attestationPda] = await deriveAttestationPda({
    credential: credentialPda,
    schema: schemaPda,
    nonce: recipient,
  });

  console.log("Credential PDA: ", credentialPda);
  console.log("Schema PDA:     ", schemaPda);
  console.log("Attestation PDA:", attestationPda);
  console.log();

  // ── Pre-serialize attestation data ─────────────────────────────────────────
  // Construct a Schema-compatible object so serializeAttestationData can
  // derive the borsh layout without needing the on-chain account first.

  const schemaForSerialization = {
    fieldNames: encodeFieldNames(FIELD_NAMES),
    layout: LAYOUT,
  } as unknown as Schema;

  const attestationBytes = serializeAttestationData(
    schemaForSerialization,
    ATTESTATION_DATA
  );

  // ── Build instructions ─────────────────────────────────────────────────────

  // The kit instruction builders need a TransactionSigner shape for payer/authority.
  // We only need the address field — signing is handled by v1 sendAndConfirmTransaction.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signer = (addr: Address) => ({ address: addr }) as any;

  const createCredentialKit = getCreateCredentialInstruction({
    payer: signer(issuerAddress),
    credential: credentialPda,
    authority: signer(issuerAddress),
    name: CREDENTIAL_NAME,
    signers: [issuerAddress],
  });

  const createSchemaKit = getCreateSchemaInstruction({
    payer: signer(issuerAddress),
    authority: signer(issuerAddress),
    credential: credentialPda,
    schema: schemaPda,
    name: SCHEMA_NAME,
    description: "SIK Hackathon participant credential",
    layout: LAYOUT,
    fieldNames: FIELD_NAMES,
  });

  const createAttestationKit = getCreateAttestationInstruction({
    payer: signer(issuerAddress),
    authority: signer(issuerAddress),
    credential: credentialPda,
    schema: schemaPda,
    attestation: attestationPda,
    nonce: recipient,
    data: attestationBytes,
    expiry: 0n,
  });

  // ── Convert to v1 and send ─────────────────────────────────────────────────

  const tx = new Transaction().add(
    toV1Instruction(createCredentialKit),
    toV1Instruction(createSchemaKit),
    toV1Instruction(createAttestationKit)
  );

  console.log("Sending transaction...");
  const sig = await sendAndConfirmTransaction(connection, tx, [keypair], {
    commitment: "confirmed",
  });

  const cluster = RPC_URL.includes("devnet") ? "devnet" : "mainnet";
  console.log();
  console.log("✅ Credential issued!");
  console.log("Signature:      ", sig);
  console.log("Attestation PDA:", attestationPda);
  console.log(`Explorer: https://explorer.solana.com/tx/${sig}?cluster=${cluster}`);
  console.log();
  console.log("Open the dashboard — the credential card should now appear.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
