import type { SIKIdentity } from "@sik-sdk/core";

export interface SIKSession {
  domain: string;
  owner: string;
  identity: SIKIdentity;
  signature: string;
  message: string;
  signedAt: number;
  expiresAt: number;
}

export interface SignInOptions {
  statement?: string;
  expiresIn?: number;
  domain?: string;
  preferredDomain?: string;
}
