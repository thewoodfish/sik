import { Connection, PublicKey } from "@solana/web3.js";
import { resolve, getRecordV2, Record as SNSRecord } from "@bonfida/spl-name-service";
import { getIdentity } from "@sik/core";
import { getCredentials } from "@sik/credentials";
import type { SIKCredential } from "@sik/credentials";
import { computeAgentTrust } from "./trust";
import { detectOperator } from "./detectOperator";
import type { AgentIdentity, AgentCapability } from "./types";

export async function getAgentIdentity(
  domain: string,
  connection: Connection
): Promise<AgentIdentity> {
  const domainWithoutSuffix = domain.replace(/\.sol$/, "");

  const owner = await resolve(connection, domainWithoutSuffix);

  const [urlResult, githubResult, credentialsResult, trustResult, operatorResult] =
    await Promise.allSettled([
      getRecordV2(connection, domainWithoutSuffix, SNSRecord.Url),
      getRecordV2(connection, domainWithoutSuffix, SNSRecord.Github),
      getCredentials(owner, connection),
      computeAgentTrust(owner, connection),
      detectOperator(owner, connection),
    ]);

  const trust = trustResult.status === "fulfilled"
    ? trustResult.value
    : { score: 0, breakdown: { operatorReputation: 0, transactionConsistency: 0, authorizationDepth: 0, programSpecialization: 0 }, registeredAt: 0, lastActive: 0 };

  const operator = operatorResult.status === "fulfilled" ? operatorResult.value : null;
  const creds = credentialsResult.status === "fulfilled" ? credentialsResult.value : [];

  // Boost trust based on number of credentials (authorization depth)
  const authorizationDepth = Math.min(25, creds.length * 5);
  trust.breakdown.authorizationDepth = authorizationDepth;
  trust.score = Object.values(trust.breakdown).reduce((a, b) => a + b, 0);

  const capabilities = extractCapabilities(creds);

  return {
    domain: `${domainWithoutSuffix}.sol`,
    address: owner.toBase58(),
    type: "agent",
    operator: operator?.address ?? null,
    operatorDomain: operator?.domain ?? null,
    capabilities,
    trustScore: trust.score,
    trustBreakdown: trust.breakdown,
    credentials: creds,
    profile: {
      name: domainWithoutSuffix,
      url: urlResult.status === "fulfilled" ? (urlResult.value?.record ?? null) : null,
      github: githubResult.status === "fulfilled" ? (githubResult.value?.record ?? null) : null,
    },
    registeredAt: trust.registeredAt,
    lastActive: trust.lastActive,
  };
}

const CAPABILITY_SCHEMA_MAP: Record<string, AgentCapability> = {
  payments: "payments",
  payment: "payments",
  web_search: "web_search",
  search: "web_search",
  code: "code_execution",
  code_execution: "code_execution",
  data: "data_access",
  data_access: "data_access",
  trading: "trading",
  trade: "trading",
  governance: "governance",
  dao: "governance",
  cross_chain: "cross_chain",
  bridge: "cross_chain",
};

function extractCapabilities(creds: SIKCredential[]): AgentCapability[] {
  const caps = new Set<AgentCapability>();
  for (const cred of creds) {
    const schemaKey = cred.schema.name.toLowerCase().replace(/[-\s]/g, "_");
    const mapped = CAPABILITY_SCHEMA_MAP[schemaKey];
    if (mapped) caps.add(mapped);

    // Also check data fields
    for (const [, val] of Object.entries(cred.data)) {
      const v = String(val).toLowerCase().replace(/[-\s]/g, "_");
      const fromVal = CAPABILITY_SCHEMA_MAP[v];
      if (fromVal) caps.add(fromVal);
    }
  }
  return Array.from(caps);
}
