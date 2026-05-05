import type { SIKCredential } from "@sik-sdk/credentials";

export type AgentCapability =
  | "payments"
  | "web_search"
  | "code_execution"
  | "data_access"
  | "trading"
  | "governance"
  | "cross_chain"
  | string;

export interface AgentTrustBreakdown {
  operatorReputation: number;
  transactionConsistency: number;
  authorizationDepth: number;
  programSpecialization: number;
}

export interface AgentIdentity {
  domain: string;
  address: string;
  type: "agent";
  operator: string | null;
  operatorDomain: string | null;
  capabilities: AgentCapability[];
  trustScore: number;
  trustBreakdown: AgentTrustBreakdown;
  credentials: SIKCredential[];
  profile: {
    name: string | null;
    url: string | null;
    github: string | null;
  };
  registeredAt: number;
  lastActive: number;
}

export interface AgentRegistration {
  domain: string;
  operator: string;
  capabilities: AgentCapability[];
  description?: string;
}
