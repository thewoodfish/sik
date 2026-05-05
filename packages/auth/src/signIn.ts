import { Connection, PublicKey } from "@solana/web3.js";
import { getAllDomains, reverseLookupBatch } from "@bonfida/spl-name-service";
import { getIdentity } from "@sik-sdk/core";
import { SIKAuthError } from "./error";
import type { SIKSession, SignInOptions } from "./types";

export async function signIn(
  wallet: {
    publicKey: PublicKey;
    signMessage: (msg: Uint8Array) => Promise<Uint8Array>;
  },
  connection: Connection,
  options?: SignInOptions
): Promise<SIKSession> {
  const domainKeys = await getAllDomains(connection, wallet.publicKey);

  if (domainKeys.length === 0) {
    throw new SIKAuthError(
      "NO_DOMAIN",
      "This wallet does not own a .sol name. Register at naming.bonfida.org"
    );
  }

  const names = await reverseLookupBatch(connection, domainKeys);
  const resolved = names.filter((n): n is string => !!n);

  if (resolved.length === 0) {
    throw new SIKAuthError("NO_DOMAIN", "Could not resolve any .sol name for this wallet.");
  }

  const domain = options?.preferredDomain ?? resolved[0]!;

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + Math.floor((options?.expiresIn ?? 86_400_000) / 1000);

  const message = buildSignInMessage({
    appDomain: options?.domain ?? "sik.identity",
    address: wallet.publicKey.toBase58(),
    solDomain: domain,
    statement: options?.statement ?? "Sign in with your Solana identity.",
    issuedAt: now,
    expiresAt,
  });

  const encodedMessage = new TextEncoder().encode(message);
  const signatureBytes = await wallet.signMessage(encodedMessage);
  const signature = Buffer.from(signatureBytes).toString("base64");

  const identity = await getIdentity(domain + ".sol", connection);

  return {
    domain: domain + ".sol",
    owner: wallet.publicKey.toBase58(),
    identity,
    signature,
    message,
    signedAt: now,
    expiresAt,
  };
}

function buildSignInMessage(params: {
  appDomain: string;
  address: string;
  solDomain: string;
  statement: string;
  issuedAt: number;
  expiresAt: number;
}): string {
  return [
    `${params.appDomain} wants you to sign in with your Solana identity.`,
    ``,
    `${params.statement}`,
    ``,
    `Address: ${params.address}`,
    `Identity: ${params.solDomain}.sol`,
    `Issued At: ${new Date(params.issuedAt * 1000).toISOString()}`,
    `Expiration Time: ${new Date(params.expiresAt * 1000).toISOString()}`,
  ].join("\n");
}
