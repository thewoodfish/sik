# SIK — Solana Identity Kit

> ENS gives you a name. SIK gives you an identity.

**Live:** https://sik-phi.vercel.app
**npm:** @sik-sdk/core · @sik-sdk/reputation · @sik-sdk/auth · @sik-sdk/agent · @sik-sdk/credentials

---

## The Problem

Every Solana app that needs identity builds the same thing from scratch:
profile resolution, reputation logic, login flow, credential checks.

Every AI agent that needs to act on-chain has no trust layer —
no way for a protocol to know if it can be trusted before granting access.

SIK solves both.

---

## What SIK Is

An open identity protocol built on SNS. One SDK call returns everything
any app — or any agent — needs to know about a `.sol` identity.

```typescript
import { getIdentity } from "@sik-sdk/core"

const identity = await getIdentity("example.sol", connection)

identity.profile        // avatar, social links, bio
identity.reputation     // 0–100 score, computed from on-chain activity
identity.credentials    // SAS-verified attestations from trusted issuers
```

For agents:

```typescript
import { getAgentIdentity } from "@sik-sdk/agent"

const agent = await getAgentIdentity("myagent.sol", connection)

agent.operator          // human wallet that controls this agent
agent.capabilities      // ["payments", "trading", "web_search"]
agent.trustScore        // computed from consistency, specialization, credentials
agent.credentials       // what protocols have authorized this agent
```

---

## Why This Is Different

| | ENS | SNS alone | SIK |
|---|---|---|---|
| Human-readable name | ✅ | ✅ | ✅ |
| On-chain reputation | ❌ | ❌ | ✅ |
| Verifiable credentials | ❌ | ❌ | ✅ |
| Agent identity layer | ❌ | ❌ | ✅ |
| One SDK call | ❌ | ❌ | ✅ |
| Solana-native | ❌ | ✅ | ✅ |

---

## Programmable Identity

Programmable means the identity responds to on-chain behaviour.

- Reputation updates as you transact
- Credentials gate access to apps and protocols
- An agent's trust score reflects its actual behaviour — not its creator's word
- Any protocol reads the same identity without coordination

This is not a profile page. It is an on-chain primitive.

---

## For dApp Developers

Without SIK, you build:
- SNS resolution logic
- Reputation scoring from scratch
- Custom login flow
- Credential verification

With SIK, you call `getIdentity()` and ship your product.

```typescript
// DAO access gate — 5 lines
const identity = await getIdentity(userDomain, connection)
if (identity.reputation.score < 70) {
  throw new Error("Reputation too low for access")
}
```

```typescript
// Agent authorization — 4 lines
const agent = await getAgentIdentity(agentDomain, connection)
if (!agent.capabilities.includes("payments")) {
  throw new Error("Agent not authorized for payments")
}
```

---

## For AI Agent Builders

Give your agent a `.sol` name. Register its capabilities on-chain.
Any protocol that uses SIK can verify your agent before granting access —
without you having to negotiate trust manually with each integration.

**How to register an agent identity:**

1. **Get a `.sol` name** for your agent wallet at [sns.id](https://sns.id)
2. **Set SNS records** — endpoint and repo identify your agent on-chain:
   ```typescript
   // Set via Bonfida SNS app, or programmatically:
   // Record.Url   → your agent's API endpoint
   // Record.Github → your agent's code repository
   ```
3. **Issue capability credentials** via the Solana Attestation Service —
   schema names map directly to capabilities SIK recognises:
   `payments` · `web_search` · `code_execution` · `data_access` · `trading` · `governance`

Once registered, any app resolves your agent in one call:

```typescript
const agent = await getAgentIdentity("myagent.sol", connection)
// agent.capabilities  → ["payments", "trading"]
// agent.trustScore    → 74
// agent.operator      → "thewoodfish.sol"
```

An agent with a SIK identity is a trustworthy agent by default.

---

## Packages

| Package | What it does |
|---|---|
| `@sik-sdk/core` | `getIdentity()` — profile + reputation + credentials |
| `@sik-sdk/reputation` | On-chain reputation scoring engine |
| `@sik-sdk/auth` | Sign In with .sol — authenticated identity sessions |
| `@sik-sdk/agent` | Agent identity — capabilities, trust, operator |
| `@sik-sdk/credentials` | SAS credential integration |

```bash
npm install @sik-sdk/core @sik-sdk/reputation
```

---

## Protocol Spec

[SIK-1 →](./docs/SIK-1.md)

---

## Roadmap

| Version | Component | Status |
|---|---|---|
| SIK-1 | Core SDK + Reputation + Auth + Agent + Credentials | ✅ Live |
| SIK-2 | Native on-chain issuer registry (Anchor program) | 🔲 Grant-funded |
| SIK-3 | ZK selective disclosure | 🔲 Planned |
| SIK-4 | Ecosystem integrations (5+ apps) | 🔲 Planned |

---

Built at Colosseum Frontier Hackathon 2026
SNS Identity Track · Social Identity + Agent Identity
