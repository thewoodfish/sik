# SIK — Solana Identity Kit

> ENS gives you a name. SIK gives you an identity.

**Live:** https://sik-phi.vercel.app
**npm:** @sik-sdk/core · @sik-sdk/reputation · @sik-sdk/auth · @sik-sdk/agent · @sik-sdk/credentials

---

## The Problem

Every Solana app that needs identity builds the same thing from scratch:
profile resolution, reputation logic, login flow, credential checks.
The result is a fragmented ecosystem where reputation is siloed per-app —
your standing on Tensor means nothing on Realms, your DAO governance history
is invisible to the lending protocol deciding whether to trust you.

Every AI agent that needs to act on-chain has no trust layer at all.
Protocols have no standard way to ask: *who built this agent, what is it
authorized to do, and has it behaved consistently?* Without a shared
primitive, every protocol builds its own verification from scratch —
or skips it entirely.

---

## Why Standardize?

The value of an identity primitive scales with how many protocols read it.

A reputation score computed once and trusted everywhere is worth
exponentially more than ten siloed scores that never leave their home app.
A credential issued by one protocol and verified by another creates
composable trust — the foundation of a permissionless ecosystem.

Standards also protect users. When identity logic lives in each app,
users have no visibility into how they are being scored or gated.
When it lives in an open, auditable protocol, anyone can verify
exactly what data produced a given score.

SIK is not trying to own identity. It is trying to make identity
a public good on Solana — the way TCP/IP made networking a public good.

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

## Human Reputation — Why These Six Signals

The reputation score is 0–100, computed entirely from public on-chain data.
No oracles. No off-chain inputs. Reproducible by anyone with an RPC.

We chose signals that are hard to fake at scale, meaningful across
different types of users, and resistant to single-vector gaming.

| Signal | Max | Reasoning |
|---|---|---|
| **Account Age** | 20 | Age is the simplest proxy for commitment. A wallet active for 2+ years is not a throwaway. Sybils are cheap to create but expensive to age. |
| **Transaction Volume** | 20 | Activity signals real usage. Log-scaled so the difference between 10 and 100 transactions matters more than 10,000 vs 100,000 — this prevents whale dominance. |
| **Program Diversity** | 20 | Breadth of on-chain engagement. A wallet that has touched governance, DeFi, and NFT programs is more deeply embedded in the ecosystem than one that only moves tokens. |
| **DAO Participation** | 20 | Governance is the highest-signal on-chain action — it requires conviction, not just capital. It is the hardest signal to fake without genuine ecosystem participation. |
| **SOL Balance** | 10 | Skin in the game. Economic stake in the network correlates with long-term alignment. Capped at 10 to prevent wealth from dominating the score. |
| **NFT Holdings** | 10 | Community membership. NFTs gate communities and signal cultural participation — a different dimension from purely financial activity. |

The 20/20/20/20/10/10 weighting reflects a deliberate choice: economic signals
(balance, NFTs) should not dominate. A whale with no governance participation
should not outscore an active DAO contributor with a modest balance.

---

## Agent Trust — Why These Four Signals

Agent trust is computed differently from human reputation for a fundamental reason:
an agent cannot demonstrate conviction, community membership, or long-term
commitment the way a human can. What an agent *can* demonstrate is
**behavioral consistency**, **earned authorizations**, and **a trustworthy origin**.

| Signal | Max | Reasoning |
|---|---|---|
| **Operator Reputation** | 30 | An agent's trustworthiness is bounded by the human who deploys it. A high-reputation operator is a strong prior that the agent was built responsibly. This is the highest-weighted signal because it is the hardest to fake — you cannot launder a bad operator's reputation through an agent. |
| **Transaction Consistency** | 25 | Trustworthy agents are regular. Humans are bursty; well-built automation follows predictable patterns. We measure the coefficient of variation in inter-transaction gaps — low variance means the agent behaves predictably, which is the core property a protocol needs before granting access. |
| **Authorization Depth** | 25 | Credentials as vouching. When an established protocol issues a SAS attestation to an agent, it is staking its own reputation on that agent's behaviour. More independent vouches from trusted issuers = more trust. This is how trust works in the real world: references, not self-declaration. |
| **Program Specialization** | 20 | Focused agents are safer agents. An agent that only interacts with payment programs is well-understood and lower-risk than one that touches every program on Solana. Specialization signals that the agent does one thing well rather than having unbounded access. |

The 30/25/25/20 weighting reflects a key insight: the operator is the
ultimate accountability anchor. Technical signals (consistency, specialization)
matter, but social proof (operator reputation, authorizations) matters more —
because technical signals can be engineered, while reputation takes time to build.

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
   ```
   Record.Url    → your agent's API endpoint
   Record.Github → your agent's code repository
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
