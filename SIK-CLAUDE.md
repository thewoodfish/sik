# CLAUDE.md — SIK v3 (Full Protocol)

## What We Are Building

SIK is the identity standard for humans and agents on Solana.

- Humans sign in with `.sol` — portable, composable, one SDK call
- Agents register `.sol` identities with capabilities and trust signals
- Both layers are live, open-source, built on SNS and SAS

This file covers three features to ship before May 11:

1. **Sign In with .sol** — `@sik/auth` — Social Identity theme
2. **Agent Identity** — `@sik/agent` — Agent Identity theme
3. **SIK-2 Credentials** — `@sik/credentials` — strengthens both themes

---

## Current State (Do Not Rebuild)

Already live at `sik-phi.vercel.app`:
- `@sik/core` — `getIdentity()` working on mainnet
- `@sik/reputation` — real scores, 6-signal breakdown
- Dashboard — `/[domain]` page, DAO gate demo, landing search
- `docs/SIK-1.md` — protocol spec exists

Build on top of this. Touch nothing that is already working.

---

## Monorepo Additions

```
sik/
  packages/
    core/           ✅ done
    reputation/     ✅ done
    dashboard/      ✅ done — extend only
    auth/           ← BUILD: Sign In with .sol
    agent/          ← BUILD: Agent Identity
    credentials/    ← BUILD: SIK-2 via SAS
```

---

## FEATURE 1: Sign In with .sol (`@sik/auth`)

### What It Is

Authentication for Solana apps using `.sol` identity.
The user connects their wallet, picks their `.sol` name,
signs a message, and gets a portable `SIKSession` object.

Every Solana app does wallet connect.
Nobody does standardised `.sol` identity sessions. This is the gap.

### Types

```typescript
// packages/auth/src/types.ts

export interface SIKSession {
  domain: string;              // "thewoodfish.sol"
  owner: string;               // wallet address (base58)
  identity: SIKIdentity;       // full identity from @sik/core
  signature: string;           // proof of ownership (base58)
  message: string;             // the message that was signed
  signedAt: number;            // unix timestamp
  expiresAt: number;           // signedAt + 24 hours
}

export interface SignInOptions {
  statement?: string;          // custom message prefix
  expiresIn?: number;          // session duration ms, default 24h
  domain?: string;             // app domain for the message
}
```

### Core Functions

```typescript
// packages/auth/src/signIn.ts

import { resolve, getAllDomains } from "@bonfida/spl-name-service";
import { getIdentity } from "@sik/core";
import { Connection, PublicKey } from "@solana/web3.js";

export async function signIn(
  wallet: {
    publicKey: PublicKey;
    signMessage: (msg: Uint8Array) => Promise<Uint8Array>;
  },
  connection: Connection,
  options?: SignInOptions
): Promise<SIKSession> {

  // 1. Resolve all .sol names owned by this wallet
  const domains = await getAllDomains(connection, wallet.publicKey);

  if (domains.length === 0) {
    throw new SIKAuthError("NO_DOMAIN",
      "This wallet does not own a .sol name. Register at naming.bonfida.org"
    );
  }

  // 2. Use first domain (primary) — multi-domain picker in dashboard
  // For SDK use: caller passes preferred domain in options
  const domain = options?.preferredDomain
    ?? domains[0].toString();

  // 3. Build the sign-in message (SIWS standard format)
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + Math.floor((options?.expiresIn ?? 86_400_000) / 1000);

  const message = buildSignInMessage({
    domain: options?.domain ?? "sik.identity",
    address: wallet.publicKey.toBase58(),
    solDomain: domain,
    statement: options?.statement ?? "Sign in with your Solana identity.",
    issuedAt: now,
    expiresAt,
  });

  // 4. Sign the message
  const encodedMessage = new TextEncoder().encode(message);
  const signatureBytes = await wallet.signMessage(encodedMessage);
  const signature = Buffer.from(signatureBytes).toString("base64");

  // 5. Resolve full identity
  const identity = await getIdentity(domain, connection);

  return {
    domain,
    owner: wallet.publicKey.toBase58(),
    identity,
    signature,
    message,
    signedAt: now,
    expiresAt,
  };
}

function buildSignInMessage(params: {
  domain: string;
  address: string;
  solDomain: string;
  statement: string;
  issuedAt: number;
  expiresAt: number;
}): string {
  return [
    `${params.domain} wants you to sign in with your Solana identity.`,
    ``,
    `${params.statement}`,
    ``,
    `Address: ${params.address}`,
    `Identity: ${params.solDomain}.sol`,
    `Issued At: ${new Date(params.issuedAt * 1000).toISOString()}`,
    `Expiration Time: ${new Date(params.expiresAt * 1000).toISOString()}`,
  ].join("\n");
}
```

```typescript
// packages/auth/src/verify.ts

import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";

export function verifySession(session: SIKSession): boolean {
  try {
    const message = new TextEncoder().encode(session.message);
    const signature = Buffer.from(session.signature, "base64");
    const publicKey = new PublicKey(session.owner).toBytes();

    // Verify signature
    const valid = nacl.sign.detached.verify(message, signature, publicKey);
    if (!valid) return false;

    // Verify not expired
    const now = Math.floor(Date.now() / 1000);
    if (now > session.expiresAt) return false;

    return true;
  } catch {
    return false;
  }
}
```

```typescript
// packages/auth/src/index.ts
export { signIn } from "./signIn";
export { verifySession } from "./verify";
export type { SIKSession, SignInOptions } from "./types";

export class SIKAuthError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "SIKAuthError";
  }
}
```

### Dashboard: Sign In Flow

Add to the landing page (`packages/dashboard/src/app/page.tsx`):

```tsx
// Sign In with .sol button
// Shows when wallet is connected but user hasn't signed in

function SignInButton() {
  const { publicKey, signMessage } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignIn() {
    if (!publicKey || !signMessage) return;
    setLoading(true);
    try {
      const session = await signIn(
        { publicKey, signMessage },
        connection
      );
      // Store session in localStorage for demo
      localStorage.setItem("sik_session", JSON.stringify(session));
      router.push(`/${session.domain}`);
    } catch (err) {
      if (err instanceof SIKAuthError && err.code === "NO_DOMAIN") {
        // Show "Register a .sol name" prompt
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleSignIn} disabled={loading}>
      {loading ? "Signing in..." : "Sign in with .sol"}
    </button>
  );
}
```

### Domain Picker (when wallet owns multiple .sol names)

```tsx
function DomainPicker({
  domains,
  onSelect,
}: {
  domains: string[];
  onSelect: (domain: string) => void;
}) {
  return (
    <div className="domain-picker">
      <p>Choose your identity:</p>
      {domains.map(domain => (
        <button key={domain} onClick={() => onSelect(domain)}>
          {domain}.sol
        </button>
      ))}
    </div>
  );
}
```

---

## FEATURE 2: Agent Identity (`@sik/agent`)

### What It Is

An on-chain identity layer for autonomous AI agents using `.sol` names.

An agent has a `.sol` name like any wallet. But its identity object
is different from a human's — it has capabilities, an operator,
and trust signals specific to autonomous systems.

The core insight: agent trust is computed differently from human reputation.
A human's score comes from DAO participation and NFT holdings.
An agent's trust comes from operator reputation, authorizations,
and behavioral consistency.

Nobody has built this on Solana. This is the novel contribution
for the Agent Identity theme.

### Types

```typescript
// packages/agent/src/types.ts

export type AgentCapability =
  | "payments"
  | "web_search"
  | "code_execution"
  | "data_access"
  | "trading"
  | "governance"
  | "cross_chain"
  | string; // extensible

export interface AgentIdentity {
  // Base identity
  domain: string;               // "myagent.sol"
  address: string;              // agent wallet address

  // Agent-specific
  type: "agent";
  operator: string | null;      // human wallet that controls this agent
  operatorDomain: string | null; // operator's .sol name if they have one

  // Capabilities — what this agent is authorized to do
  capabilities: AgentCapability[];

  // Trust
  trustScore: number;           // 0–100, different signals from human reputation
  trustBreakdown: AgentTrustBreakdown;

  // Credentials — SAS attestations authorizing the agent
  credentials: SIKCredential[]; // from @sik/credentials

  // Profile from SNS Records
  profile: {
    name: string | null;        // Record.CNAME or custom
    url: string | null;         // agent's endpoint / API
    github: string | null;      // agent's code repo
  };

  registeredAt: number;         // first tx timestamp
  lastActive: number;           // most recent tx timestamp
}

export interface AgentTrustBreakdown {
  operatorReputation: number;   // 0–30: inherit from operator's SIK score
  transactionConsistency: number; // 0–25: regularity of activity
  authorizationDepth: number;   // 0–25: number of trusted credentials
  programSpecialization: number; // 0–20: focused vs scattered program usage
}

export interface AgentRegistration {
  domain: string;               // agent's .sol name
  operator: string;             // operator wallet (base58)
  capabilities: AgentCapability[];
  description?: string;
}
```

### Core Functions

```typescript
// packages/agent/src/getAgentIdentity.ts

import { Connection, PublicKey } from "@solana/web3.js";
import { resolve, getRecordV2, Record } from "@bonfida/spl-name-service";
import { getIdentity } from "@sik/core";
import { getCredentials } from "@sik/credentials";
import { computeAgentTrust } from "./trust";
import { detectOperator } from "./detectOperator";

export async function getAgentIdentity(
  domain: string,
  connection: Connection
): Promise<AgentIdentity> {

  const domainWithoutSuffix = domain.replace(".sol", "");

  // Resolve owner
  const owner = await resolve(connection, domainWithoutSuffix);

  // Fetch in parallel
  const [urlRecord, githubRecord, credentials, trustData, operatorResult] =
    await Promise.allSettled([
      getRecordV2(connection, domainWithoutSuffix, Record.Url),
      getRecordV2(connection, domainWithoutSuffix, Record.Github),
      getCredentials(owner, connection),
      computeAgentTrust(owner, connection),
      detectOperator(owner, connection),
    ]);

  const trust = trustData.status === "fulfilled"
    ? trustData.value
    : { score: 0, breakdown: { operatorReputation: 0, transactionConsistency: 0, authorizationDepth: 0, programSpecialization: 0 } };

  const operator = operatorResult.status === "fulfilled"
    ? operatorResult.value
    : null;

  // Extract capabilities from SAS credentials
  const creds = credentials.status === "fulfilled" ? credentials.value : [];
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
      url: urlRecord.status === "fulfilled"
        ? urlRecord.value?.record ?? null : null,
      github: githubRecord.status === "fulfilled"
        ? githubRecord.value?.record ?? null : null,
    },
    registeredAt: trust.registeredAt,
    lastActive: trust.lastActive,
  };
}
```

```typescript
// packages/agent/src/trust.ts

import { Connection, PublicKey } from "@solana/web3.js";
import { getIdentity } from "@sik/core";

export async function computeAgentTrust(
  agent: PublicKey,
  connection: Connection
): Promise<{
  score: number;
  breakdown: AgentTrustBreakdown;
  registeredAt: number;
  lastActive: number;
}> {

  const signatures = await connection.getSignaturesForAddress(
    agent,
    { limit: 1000 }
  );

  if (signatures.length === 0) {
    return {
      score: 0,
      breakdown: {
        operatorReputation: 0,
        transactionConsistency: 0,
        authorizationDepth: 0,
        programSpecialization: 0,
      },
      registeredAt: 0,
      lastActive: 0,
    };
  }

  const sorted = signatures
    .filter(s => s.blockTime)
    .sort((a, b) => (a.blockTime ?? 0) - (b.blockTime ?? 0));

  const registeredAt = sorted[0]?.blockTime ?? 0;
  const lastActive = sorted[sorted.length - 1]?.blockTime ?? 0;

  // Transaction consistency — agents should be regular, not bursty
  const consistency = scoreConsistency(sorted);

  // Program specialization — good agents use focused set of programs
  const programIds = new Set(
    signatures.map(s => s).filter(Boolean)
  );
  const specialization = scoreSpecialization(programIds.size);

  const breakdown = {
    operatorReputation: 0, // filled in by getAgentIdentity after operator resolve
    transactionConsistency: consistency,
    authorizationDepth: 0, // filled in after credentials loaded
    programSpecialization: specialization,
  };

  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return { score, breakdown, registeredAt, lastActive };
}

function scoreConsistency(
  signatures: { blockTime?: number | null }[]
): number {
  if (signatures.length < 2) return 0;

  // Compute variance in inter-transaction gaps
  // Low variance = consistent agent = higher score
  const gaps: number[] = [];
  for (let i = 1; i < signatures.length; i++) {
    const gap = (signatures[i].blockTime ?? 0) - (signatures[i-1].blockTime ?? 0);
    gaps.push(gap);
  }

  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variance = gaps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / gaps.length;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 1; // coefficient of variation

  // Low CV = consistent = high score
  return Math.min(25, Math.max(0, Math.round(25 * (1 - Math.min(cv, 1)))));
}

function scoreSpecialization(uniquePrograms: number): number {
  // Fewer unique programs = more specialized = higher trust for an agent
  // 1-3 programs: 20pts, 4-8: 15pts, 9-15: 10pts, 16+: 5pts
  if (uniquePrograms <= 3) return 20;
  if (uniquePrograms <= 8) return 15;
  if (uniquePrograms <= 15) return 10;
  return 5;
}
```

```typescript
// packages/agent/src/detectOperator.ts
// Detect the human operator of an agent by looking for
// the wallet that funded the agent's first transaction

import { Connection, PublicKey } from "@solana/web3.js";
import { resolve } from "@bonfida/spl-name-service";

export async function detectOperator(
  agent: PublicKey,
  connection: Connection
): Promise<{ address: string; domain: string | null } | null> {
  try {
    const signatures = await connection.getSignaturesForAddress(
      agent,
      { limit: 1 }
    );

    if (signatures.length === 0) return null;

    const tx = await connection.getParsedTransaction(
      signatures[signatures.length - 1].signature,
      { maxSupportedTransactionVersion: 0 }
    );

    // The fee payer of the first transaction is likely the operator
    const feePayer = tx?.transaction.message.accountKeys[0]?.pubkey;
    if (!feePayer) return null;

    // Try to resolve a .sol name for the operator
    // This is best-effort — no error if they don't have one
    let domain: string | null = null;
    // Note: reverse SNS lookup is not directly supported
    // Leave as null — operator address is still valuable

    return { address: feePayer.toBase58(), domain };
  } catch {
    return null;
  }
}
```

```typescript
// packages/agent/src/register.ts
// Register an agent identity by writing to SNS Records

import { Connection, PublicKey } from "@solana/web3.js";

export interface RegisterAgentParams {
  domain: string;
  capabilities: AgentCapability[];
  endpoint?: string;       // agent's API URL → SNS Record.Url
  repository?: string;     // code repo → SNS Record.Github
  wallet: {
    publicKey: PublicKey;
    signTransaction: (tx: any) => Promise<any>;
  };
  connection: Connection;
}

export async function registerAgent(
  params: RegisterAgentParams
): Promise<{ signature: string }> {
  // Write capabilities to SNS Record.CNAME as JSON
  // Write endpoint to SNS Record.Url
  // Write repository to SNS Record.Github
  // These become the agent's on-chain identity fields

  // Implementation uses @bonfida/spl-name-service updateRecord
  // Each record write is a separate transaction

  const domainWithoutSuffix = params.domain.replace(".sol", "");

  // Build and send record update transactions
  // Return the final signature
  throw new Error("Not implemented — see SNS record update docs");
}
```

```typescript
// packages/agent/src/index.ts
export { getAgentIdentity } from "./getAgentIdentity";
export { registerAgent } from "./register";
export { computeAgentTrust } from "./trust";
export type {
  AgentIdentity,
  AgentCapability,
  AgentTrustBreakdown,
  AgentRegistration,
} from "./types";
```

---

## FEATURE 3: `@sik/credentials` (SIK-2 via SAS)

### Setup

```bash
cd packages/credentials
npm install sas-lib
```

### Core Implementation

```typescript
// packages/credentials/src/getCredentials.ts

import { Connection, PublicKey } from "@solana/web3.js";
import {
  fetchAttestationsByNonce,
  fetchCredential,
  fetchSchema,
  deserializeAttestationData,
} from "sas-lib";
import { SIKCredential } from "./types";

export async function getCredentials(
  owner: PublicKey,
  connection: Connection
): Promise<SIKCredential[]> {

  let attestations: any[];

  try {
    attestations = await fetchAttestationsByNonce(connection, owner);
  } catch {
    return [];
  }

  if (!attestations || attestations.length === 0) return [];

  const results = await Promise.allSettled(
    attestations.map(att => mapAttestation(att, connection))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<SIKCredential> =>
      r.status === "fulfilled"
    )
    .map(r => r.value);
}

async function mapAttestation(
  attestation: any,
  connection: Connection
): Promise<SIKCredential> {

  const now = Math.floor(Date.now() / 1000);

  const [credential, schema] = await Promise.all([
    fetchCredential(connection, attestation.data.credential).catch(() => null),
    fetchSchema(connection, attestation.data.schema).catch(() => null),
  ]);

  let data: Record<string, unknown> = {};
  if (schema) {
    try {
      data = deserializeAttestationData(schema.data, attestation.data.data);
    } catch {
      data = {};
    }
  }

  const expiresAt = attestation.data.expiry
    ? Number(attestation.data.expiry)
    : null;

  return {
    id: attestation.address.toString(),
    issuer: {
      address: credential?.data.authority.toString() ?? "unknown",
      credentialPda: attestation.data.credential.toString(),
      name: null,
    },
    schema: {
      pda: attestation.data.schema.toString(),
      name: schema?.data.name ?? "unknown",
    },
    issuedAt: attestation.data.createdAt
      ? Number(attestation.data.createdAt) : 0,
    expiresAt,
    expired: expiresAt !== null && now > expiresAt,
    data,
  };
}
```

### Wire into `@sik/core`

In `packages/core/src/getIdentity.ts`, add credentials to the
parallel fetch block:

```typescript
import { getCredentials } from "@sik/credentials";

const [profileResult, reputationResult, credentialsResult] =
  await Promise.allSettled([
    fetchProfile(owner, connection),
    computeReputation(owner, connection),
    getCredentials(owner, connection),
  ]);

// In the return object:
credentials: credentialsResult.status === "fulfilled"
  ? credentialsResult.value
  : [],
```

### Issue a Demo Credential (Run Once)

```typescript
// scripts/issue-demo-credential.ts
// Run this on devnet first to confirm it works, then mainnet

import {
  getCreateCredentialInstruction,
  getCreateSchemaInstruction,
  getCreateAttestationInstruction,
  deriveCredentialPda,
  deriveSchemaPda,
  deriveAttestationPda,
  sendAndConfirmInstructions,
} from "sas-lib";

// Creates: "SIK Hackathon Participant" credential
// Issues to: your wallet (the one that owns bonfida.sol or your .sol)
// After running: credential appears on dashboard live
```

---

## Dashboard Extensions

### Add Agent Identity Page: `/agent/[domain]`

```
packages/dashboard/src/app/
  agent/
    [domain]/
      page.tsx    ← AgentIdentityPage
```

```tsx
// AgentIdentityPage — parallel to the human identity page
// Shows: agent address, operator, capabilities badges,
//        trust score + breakdown, credentials, last active

export default async function AgentPage({
  params,
}: {
  params: { domain: string };
}) {
  const agentIdentity = await getAgentIdentity(params.domain, connection);
  return <AgentCard identity={agentIdentity} />;
}
```

### `<AgentCard />` Component

Key visual elements:
- **Agent badge** — label clearly: "Agent Identity"
- **Operator link** — "Operated by [wallet] ([domain].sol if known)"
- **Capabilities** — pill badges: `payments` `web_search` `trading`
- **Trust score** — same visual as reputation but labeled "Trust Score"
- **Last Active** — relative time: "2 hours ago"
- **Credentials** — from SAS: what protocols have authorized this agent

### Sign In Button on Landing Page

Add between the search box and the demo link:

```tsx
<div className="signin-section">
  <WalletMultiButton />
  {connected && <SignInButton />}
</div>
```

---

## 3-Day Build Plan

**Day 1 — Sign In with .sol**
- Scaffold `packages/auth/`
- Implement `signIn()` and `verifySession()`
- Add Sign In button to dashboard landing page
- Test: connect wallet → sign → redirect to `/{domain}` page
- Confirm session object is correct

**Day 2 — Agent Identity + Credentials**
- Scaffold `packages/agent/`
- Implement `getAgentIdentity()`, `computeAgentTrust()`, `detectOperator()`
- Scaffold `packages/credentials/`
- Implement `getCredentials()` via SAS
- Wire credentials into `getIdentity()` in `@sik/core`
- Add `/agent/[domain]` page to dashboard
- Run `issue-demo-credential.ts` on devnet

**Day 3 — Polish + Deploy**
- Issue demo credential on mainnet
- Test all four pages: `/`, `/bonfida.sol`, `/agent/[agent-domain]`,
  `/demo/dao-gate`
- Publish `@sik/auth`, `@sik/agent`, `@sik/credentials` to npm
- Update `docs/SIK-1.md` to reflect all shipped features
- Deploy to Vercel
- Record demo video

---

## npm Packages (All Must Be Published)

| Package | Status |
|---|---|
| `@sik/core` | ✅ Publish |
| `@sik/reputation` | ✅ Publish |
| `@sik/auth` | ← Publish after Day 1 |
| `@sik/agent` | ← Publish after Day 2 |
| `@sik/credentials` | ← Publish after Day 2 |

```bash
# In each package after build:
npm publish --access public
```

---

## Submission Text (Copy-Paste Ready)

**Project:** SIK — Solana Identity Kit

**One-liner:** The identity standard for humans and agents on Solana —
profile, reputation, credentials, and sign-in from a single SDK call.

**Description:**
SIK is an open identity protocol built on SNS that covers both tracks
of this hackathon in a single, composable SDK.

**Social Identity:** Any Solana app integrates `.sol` login with
`signIn()` from `@sik/auth` — a standardised authentication session
that returns profile, reputation, and credentials alongside the
cryptographic proof of ownership. No custom identity logic required.

**Agent Identity:** Autonomous agents register `.sol` identities with
on-chain capabilities and trust signals via `@sik/agent`. An agent's
trust score is computed from operator reputation, transaction
consistency, authorization depth, and program specialization —
different signals from a human, right signal for a machine.

**Credentials:** `@sik/credentials` connects the Solana Attestation
Service to `.sol` identity. Any app calls `getIdentity()` and receives
SAS-verified credentials alongside profile and reputation, without
knowing anything about SAS internals.

SIK is not an app. It is infrastructure — five open-source packages,
a live protocol spec, and a reference dashboard. Every feature
is live at sik-phi.vercel.app.

**Live:** https://sik-phi.vercel.app
**GitHub:** https://github.com/thewoodfish/sik
**Packages:** @sik/core · @sik/reputation · @sik/auth · @sik/agent · @sik/credentials

---

## Definition of Done

- [ ] `signIn("example.sol")` returns a valid `SIKSession`
- [ ] `verifySession(session)` returns `true` for a freshly created session
- [ ] `getAgentIdentity("agent.sol")` returns trust score and capabilities
- [ ] `/agent/[domain]` page loads on dashboard
- [ ] `getCredentials(wallet)` returns `[]` gracefully for empty wallets
- [ ] At least one real SAS credential visible on dashboard for own wallet
- [ ] All 5 packages published to npm
- [ ] All pages live on Vercel
- [ ] `docs/SIK-1.md` updated to reflect all shipped features
- [ ] Submission filed before May 11