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

Most identity systems are static. You fill in a profile once.
It sits there. Nothing changes unless you manually update it.

SIK identity is live. It reads the chain every time it is called.
The moment a user casts a governance vote, their DAO participation
signal increases. The moment an agent completes its hundredth
consistent transaction, its consistency score improves. No one
has to update anything — the behaviour is the identity.

This is what "programmable" means: **identity that changes because
you did something, not because you said something.**

### What changes and when

**Reputation score** recalculates on every `getIdentity()` call against
live on-chain state. A user who was borderline last week may qualify
today — and your app reflects that automatically, with no migration,
no manual sync, no webhook to maintain.

```typescript
// Tuesday: score 48 — just below your DAO threshold
const identity = await getIdentity("alice.sol", connection)
// identity.reputation.score → 48

// Alice votes in three governance proposals over the weekend

// Monday: same call, live data, new score
const identity = await getIdentity("alice.sol", connection)
// identity.reputation.score → 63 — she now qualifies
```

**Credentials** appear the moment they are issued on-chain.
A protocol issues a SAS attestation to a user's wallet —
the next `getIdentity()` call returns it in `credentials[]`.
No integration work on the issuer's side. No sync required on yours.

```typescript
// Before: user completes a KYC flow with a third-party issuer
identity.credentials // → []

// Issuer writes attestation to Solana
// No webhook, no API call, no database update needed on your end

// After: same call to getIdentity()
identity.credentials // → [{ schema: "kyc-verified", expired: false, ... }]
```

**Agent trust** evolves as the agent acts. An agent that has been
operating consistently for six months has a fundamentally different
trust profile than one deployed yesterday — and any protocol that
calls `getAgentIdentity()` sees that difference automatically.

### Why this matters for protocol design

Static allowlists decay. A wallet on your allowlist today may be
compromised tomorrow. A wallet excluded today may have earned
access by next month. Maintaining lists is operational overhead
that grows with your user base.

Programmable identity inverts the model. Instead of maintaining
who is allowed, you define the standard — and the chain maintains
the list for you.

```typescript
// Instead of: maintaining an allowlist of 10,000 addresses
const allowed = new Set(["addr1", "addr2", ...])
if (!allowed.has(userAddress)) throw new Error("Not allowed")

// SIK: define the standard once, the chain enforces it
const identity = await getIdentity(userDomain, connection)
if (identity.reputation.score < 60) throw new Error("Below threshold")
// The "allowlist" is now every wallet on Solana with score >= 60
// It updates itself. You never touch it again.
```

### Caching and freshness

By default, `getIdentity()` caches results for 1 hour. For
high-stakes decisions (large withdrawals, governance proposals),
bypass the cache for a fresh read:

```typescript
// Force a live read — no cache
const identity = await getIdentity(domain, connection, { cache: false })

// Custom TTL — re-fetch every 5 minutes in a live dashboard
const identity = await getIdentity(domain, connection, { cacheTTL: 300_000 })
```

For most apps, the 1-hour default is the right tradeoff between
RPC cost and data freshness. Reputation does not change minute to minute.

---

## For dApp Developers

### The hidden tax on every Solana app

Every serious Solana app eventually needs to answer the same questions:
*Who is this user? Can they be trusted? Have they earned access?*

Right now, every team answers these questions independently — building
bespoke reputation logic, custom login flows, and siloed scoring systems
that only work within their own app. The result:

- A user's 3-year governance history on Realms is invisible to your lending protocol.
- Your NFT marketplace has no way to reward loyal community members without
  building an allowlist system from scratch.
- An airdrop that wants to exclude sybils has to re-derive on-chain signals
  that every other team has already computed.
- A DeFi protocol that wants to offer better rates to proven users has to
  build an entire reputation engine before shipping the core product.

SIK eliminates this tax. One call. Shared infrastructure. Reputation that
travels with the user across every app that adopts the standard.

---

### What you can build in an afternoon

**1. Reputation-gated access**

The simplest and most powerful use case. Require a minimum reputation score
before users can access a feature, cast a vote, or claim a reward.

```typescript
import { getIdentity } from "@sik-sdk/core"

const identity = await getIdentity(userDomain, connection)
const score = identity.reputation.score

// Gate a DAO proposal — require established participants only
if (score < 50) {
  throw new Error(`Reputation too low. Score: ${score}/100. Minimum: 50.`)
}

// Tiered access — give more power to more trusted users
const votingWeight = score >= 80 ? 3 : score >= 50 ? 2 : 1
```

No custom scoring. No data pipeline. The signal is already on-chain —
SIK just surfaces it through a single function call.

---

**2. Sybil-resistant airdrops**

Reputation filters throwaway wallets without requiring KYC or whitelists.
A wallet with high account age, transaction volume, and program diversity
is orders of magnitude harder to fake than a fresh address.

```typescript
const identities = await Promise.all(
  claimants.map(domain => getIdentity(domain, connection))
)

const eligible = identities.filter(id => {
  const { accountAge, transactionVolume, programDiversity } = id.reputation.breakdown
  // Require genuine ecosystem participation — not just a wallet that exists
  return accountAge >= 10 && transactionVolume >= 10 && programDiversity >= 5
})
```

You control the threshold. The data is public and verifiable — any claimant
can audit exactly why they qualified or were excluded.

---

**3. Sign In with .sol**

Replace wallet-address-only login with a full identity session. Your app
gets the user's `.sol` name, profile, reputation, and a cryptographic
proof of ownership — in three lines.

```typescript
import { signIn, verifySession } from "@sik-sdk/auth"

// On the client — user signs a message with their wallet
const session = await signIn({ publicKey, signMessage }, connection)
// session.domain      → "alice.sol"
// session.identity    → full SIKIdentity (profile + reputation + credentials)
// session.signature   → cryptographic proof, verifiable server-side

// On the server — verify without calling the chain
const valid = verifySession(session) // true/false, checks signature + expiry
```

Users get a portable identity session. You get a verified `.sol` name
instead of a raw public key — something you can display, index, and build
social features around.

---

**4. Credential-gated features**

Use SAS-issued credentials to gate access to features that require
verified claims — KYC, institutional status, community membership.

```typescript
const identity = await getIdentity(userDomain, connection)

const isVerified = identity.credentials.some(
  cred => cred.schema.name === "kyc-verified" && !cred.expired
)

const isMember = identity.credentials.some(
  cred => cred.schema.name === "superteam-member"
)

// Gate an OTC desk to verified institutions
if (!isVerified) throw new Error("KYC credential required")
```

The credential was issued on-chain by the verifying party.
Your app does not perform the verification — it trusts the issuer's
attestation the same way a website trusts a TLS certificate.

---

**5. Tiered UX based on on-chain history**

Surface the right experience for the right user without asking them
anything. Their on-chain history already tells you who they are.

```typescript
const identity = await getIdentity(userDomain, connection)
const { score, breakdown } = identity.reputation

// Personalise the experience based on what they've actually done
const isGovernanceUser = breakdown.daoParticipation > 10
const isNftCollector = breakdown.nftHoldings > 5
const isHighVolume = breakdown.transactionVolume >= 18

// Show the relevant features — no survey, no onboarding flow
if (isGovernanceUser) showGovernanceTools()
if (isNftCollector) showCollectionFeatures()
if (isHighVolume) unlockAdvancedTrading()
```

---

### The composability argument

The reason to adopt SIK is not just convenience — it is network effects.

Every app that reads SIK reputation makes reputation more valuable
for users. Every credential issued via SIK becomes visible across
every app that checks credentials. The more protocols adopt the standard,
the more powerful each individual integration becomes.

A reputation score that only works in one app is a feature.
A reputation score that works everywhere is infrastructure.

---

## The Agent Identity Problem

AI agents are about to become the dominant actor on every blockchain.
They will trade, govern, borrow, bridge, and deploy capital —
autonomously, at a speed no human can match.

Protocols are not ready for this.

Right now, the only question any protocol can answer about an incoming
agent transaction is: *does this wallet have funds?* There is no way to ask
who built the agent, whether it has behaved consistently, what it is
authorized to do, or whether the human behind it is accountable.
The result is a binary choice that every protocol faces:

- **Block agents entirely.** Safe, but you exclude a growing class of
  legitimate, high-value participants. The protocol becomes less liquid,
  less competitive, less useful.
- **Accept all agents.** Accessible, but you have no way to distinguish
  a well-built, authorized agent from a bot deployed by an attacker.
  The protocol becomes a target.

There is no middle ground — because there is no shared trust layer.

Every team that wants to gate agent access builds their own solution:
custom allowlists, private API keys, manual review processes.
These solutions do not compose. An agent vetted by one protocol
is unknown to every other protocol. Trust earned in one ecosystem
never travels. The verification work is repeated from scratch,
every time, by every team.

This is exactly where Ethereum was with identity before ENS.
Every app had its own username system. Nothing composed.
The answer was a standard — and once a standard existed,
the entire ecosystem could build on top of it.

SIK is that standard for agent identity on Solana.

---

## What Changes With Agent Identity

When agents have on-chain identities, the protocol design space opens up
in ways that are impossible today.

### Permissionless agent access — without blind trust

Instead of allowlisting specific agent addresses, protocols define a trust
standard and let any agent that meets it in. The protocol does not have
to know the agent exists in advance. The agent does not have to negotiate
access. Trust is computed, not granted.

```typescript
// A DeFi protocol that wants to allow agents, but only trusted ones
const agent = await getAgentIdentity(agentDomain, connection)

// Three checks replace an entire manual review process:
const isAuthorized = agent.trustScore >= 70
const canTrade     = agent.capabilities.includes("trading")
const isAccountable = !!agent.operator  // someone is on the hook

if (isAuthorized && canTrade && isAccountable) {
  allowAgentOrder(agent)
}
```

No allowlist to maintain. No manual review. Any agent in the world
can earn access to this protocol by building trust on-chain.

---

### Operator accountability — agents are no longer anonymous

The most dangerous thing about an anonymous agent is not what it does —
it is that no one is accountable when it goes wrong.

SIK ties every agent to the human who deployed it.
The operator is identified on-chain. Their reputation is inherited by the agent.
A bad actor who deploys a malicious agent damages their own SIK score —
a score that gates their access to every other SIK-integrated protocol.

This changes the incentive structure. Operators are no longer anonymous.
Deploying a harmful agent has real, on-chain consequences.

```typescript
const agent = await getAgentIdentity("suspect-agent.sol", connection)

// The operator behind this agent is visible
console.log(agent.operator)       // "Fw1ETanDZaf…"
console.log(agent.operatorDomain) // "alice.sol"

// Her human reputation feeds directly into the agent's trust score
// A bad operator cannot deploy a trusted agent
console.log(agent.trustBreakdown.operatorReputation) // 8/30 — low
```

When something goes wrong, there is a `.sol` name attached to it.
That is a fundamentally different accountability model than
"anonymous wallet deployed agent."

---

### Credential composability — trust issued once, used everywhere

Today, if an institutional trading firm wants to give their agent
access to a DeFi protocol, they negotiate bilaterally:
exchange API keys, sign agreements, go through a KYC process —
then repeat the whole thing for every protocol.

With SIK, a credential issued once works everywhere.

```typescript
// Issuer: a compliance protocol authorizes an institutional agent
// (this happens once, on-chain, via the Solana Attestation Service)

// Consumer: any protocol reads the credential without contacting the issuer
const agent = await getAgentIdentity("firm-agent.sol", connection)

const isInstitutional = agent.credentials.some(
  c => c.schema.name === "institutional-trader" && !c.expired
)
const isCompliant = agent.credentials.some(
  c => c.schema.name === "kyc-verified" && !c.expired
)

// The DeFi protocol trusts the issuer's attestation
// No bilateral negotiation. No repeated KYC.
if (isInstitutional && isCompliant) allowInstitutionalAccess(agent)
```

The compliance issuer stakes its own reputation on every credential it issues.
The protocol does not verify the agent — it trusts the issuer,
the same way a website trusts a TLS certificate.
One verification. Portable everywhere.

---

### Multi-agent verification — trust chains for agent networks

The next generation of AI systems is not a single agent.
It is hierarchies of agents: orchestrators that spawn sub-agents,
sub-agents that call tools, tools that act on-chain.

Every node in this network needs a trust identity.
And the trust of a sub-agent should be bounded by the trust of
the agent that deployed it — which is bounded by the human who built that.

```typescript
// An orchestrator agent spawning a specialized sub-agent
const orchestrator = await getAgentIdentity("orchestrator.sol", connection)
const subAgent     = await getAgentIdentity("sub-trader.sol", connection)

// The sub-agent's operator IS the orchestrator agent
// Its trustScore is bounded by the orchestrator's score
// Which is bounded by the human operator's reputation
// Trust flows down the chain. Accountability flows up.

const chainTrust = Math.min(orchestrator.trustScore, subAgent.trustScore)
```

This is not possible without a shared identity primitive.
Without SIK, a protocol has no way to reason about agent hierarchies —
it can only see individual wallets with no relationship between them.

---

### DAO-governed agent economies

DAOs are about to face a new governance question:
*which agents should be allowed to act on behalf of our protocol?*

SIK makes this governable. A DAO can set trust thresholds by vote,
issue capability credentials to approved agents, and revoke them on-chain.
No code change required. The governance action is the access control.

```typescript
// DAO governance proposal result: raise the agent trust threshold to 80
// This single parameter change re-evaluates access for every agent

const AGENT_THRESHOLD = 80 // previously 70, raised by governance vote

const agents = await Promise.all(
  proposedAgents.map(domain => getAgentIdentity(domain, connection))
)

// Agents that met the old threshold but not the new one are automatically excluded
// No manual review. No updated allowlist. The standard governs.
const approved = agents.filter(a => a.trustScore >= AGENT_THRESHOLD)
```

---

### The landscape shift

The current model: every protocol decides, individually, whether to trust
each agent. Trust is negotiated, not computed. Access is granted, not earned.

The SIK model: agents earn trust through on-chain behavior over time.
Protocols define standards. The chain enforces them.
Trust is portable. Credentials compose. Accountability is real.

This is the same shift that happened when the web moved from
"manually decide which sites to trust" to "trust any site with a valid TLS cert."
The shift did not just make things more convenient — it made an entirely
new class of interaction possible. You cannot build the modern internet
on manually-negotiated trust. You cannot build an autonomous agent economy
on manually-negotiated trust either.

The agent economy is coming to Solana regardless.
The question is whether protocols will be able to participate in it —
or whether they will spend the next three years building bespoke
verification systems that only work inside their own walls.

SIK is the infrastructure layer that lets them participate.

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

SIK is designed to be implemented by anyone, not just this SDK.
The spec defines exactly what a conforming implementation must do:
the `SIKIdentity` and `AgentIdentity` types, the resolution algorithms,
the reputation scoring formula with exact math, and the agent trust
scoring formula — so that any team can build a compatible implementation
and the ecosystem stays coherent.

If you are building a protocol that needs to verify identities,
read the spec rather than reading the SDK source — the spec is the
source of truth.

If you want to propose changes to the scoring signals or weights,
open an issue against the spec. Changes to the formula affect every
integration downstream, so they warrant explicit versioning.

**[SIK-1 Protocol Specification →](./docs/SIK-1.md)**

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
