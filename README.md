# SIK — Solana Identity Kit

The identity standard for humans and agents on Solana. One SDK call resolves any `.sol` name to a full identity — profile, reputation, credentials, and authentication sessions.

**Live:** https://sik-phi.vercel.app · **npm:** `@sik/core` · `@sik/reputation` · `@sik/auth` · `@sik/agent` · `@sik/credentials`

---

```typescript
import { getIdentity }      from "@sik/core";
import { signIn }           from "@sik/auth";
import { getAgentIdentity } from "@sik/agent";

// Resolve any .sol identity
const identity = await getIdentity("bonfida.sol", connection);
console.log(identity.reputation.score);  // 44
console.log(identity.credentials);       // SAS-verified on-chain credentials

// Authenticate a user
const session = await signIn({ publicKey, signMessage }, connection);
console.log(session.domain);             // "thewoodfish.sol"

// Resolve an agent identity
const agent = await getAgentIdentity("myagent.sol", connection);
console.log(agent.trustScore);           // 0–100
console.log(agent.capabilities);         // ["payments", "web_search"]
```

---

## Why it exists

Every Solana app that needs identity — DAOs, marketplaces, AI agents — rebuilds the same profile + reputation + auth logic from scratch. SIK standardises it. Five packages, one SDK, portable across every app.

---

## Packages

| Package | Description |
|---|---|
| [`@sik/core`](packages/core) | `getIdentity()` — resolve any `.sol` to a full `SIKIdentity` |
| [`@sik/reputation`](packages/reputation) | On-chain reputation scoring engine (0–100) |
| [`@sik/auth`](packages/auth) | `signIn()` — Sign In with .sol, standardised auth sessions |
| [`@sik/agent`](packages/agent) | `getAgentIdentity()` — trust scores and capabilities for AI agents |
| [`@sik/credentials`](packages/credentials) | SAS-backed verifiable on-chain attestations |
| [`@sik/dashboard`](packages/dashboard) | Next.js reference app — live at sik-phi.vercel.app |

## Quick Start

```bash
pnpm install
pnpm build
pnpm dev        # http://localhost:3000
```

---

## Reputation Scoring

0–100, computed entirely from public on-chain data. No oracles. Reproducible by anyone with an RPC.

| Signal | Max | Source |
|---|---|---|
| Account age | 20 | Age of oldest transaction |
| Transaction volume | 20 | Log-scaled tx count |
| Program diversity | 20 | Unique programs interacted with |
| DAO participation | 20 | Governance program interactions |
| SOL balance | 10 | Current SOL holdings |
| NFT holdings | 10 | Token accounts with supply=1 |
| **Total** | **100** | |

---

## Agent Trust Scoring

Agents are scored differently from humans — their trust comes from operator reputation, transaction consistency, authorization depth (SAS credentials), and program specialization.

| Signal | Max | Source |
|---|---|---|
| Operator reputation | 30 | Inherited from operator's SIK score |
| Transaction consistency | 25 | Regularity of on-chain activity |
| Authorization depth | 25 | Number of SAS-issued credentials |
| Program specialization | 20 | Focused vs scattered program usage |
| **Total** | **100** | |

---

## Protocol Roadmap

| Version | Component | Status |
|---|---|---|
| SIK-1 | Core SDK + Reputation Layer | ✅ Live |
| SIK-2 | Credentials via Solana Attestation Service | ✅ Live |
| SIK-3 | Sign In with .sol + Agent Identity | ✅ Live |
| SIK-4 | ZK Selective Disclosure | Planned |

See [docs/SIK-1.md](docs/SIK-1.md) for the full protocol specification.

---

Built for the Colosseum Frontier Hackathon · SNS Identity + Agent Identity tracks · May 2026
