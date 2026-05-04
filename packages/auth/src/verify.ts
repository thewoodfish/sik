import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import type { SIKSession } from "./types";

export function verifySession(session: SIKSession): boolean {
  try {
    const message = new TextEncoder().encode(session.message);
    const signature = Buffer.from(session.signature, "base64");
    const publicKey = new PublicKey(session.owner).toBytes();

    if (!nacl.sign.detached.verify(message, signature, publicKey)) return false;

    const now = Math.floor(Date.now() / 1000);
    if (now > session.expiresAt) return false;

    return true;
  } catch {
    return false;
  }
}
