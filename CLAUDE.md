# CLAUDE.md — SIK Final Sprint (Narrative + UI)

## Context

8 hours left. Code is mostly done. The problem is narrative and UI.
A friend reviewed the project and identified four gaps:

1. USP is not clear — looks like aggregated pieces, not a standard
2. Agent identity is undersold — this is the most forward-looking piece
3. "Programmable identity" is not explained
4. Dapp dev value is not obvious from the UI

This file fixes all four. In order.

---

## The Framing That Wins

Stop leading with "identity standard."
Lead with the agent future. Then prove it with the human layer.

**The thesis in two sentences:**
> Every autonomous AI agent needs an identity that on-chain protocols
> can trust. SIK gives agents — and the humans who build them — a
> `.sol` name, a trust score, and verifiable credentials that any
> protocol can read with one SDK call.

**The ENS answer (one line, memorise it):**
> ENS gives you a name. SIK gives you an identity —
> one that agents can own, protocols can verify,
> and apps can read without building anything from scratch.

**The "programmable identity" answer:**
> Programmable means it changes based on what you do.
> Your reputation updates as you transact.
> Your credentials gate your access.
> An agent's trust score reflects its behaviour.
> Identity is not a static profile — it's a live on-chain primitive.

---

## Part 1: README Rewrite

Replace the entire README with exactly this structure.
No fluff. No filler. Every line earns its place.

```markdown
# SIK — Solana Identity Kit

> ENS gives you a name. SIK gives you an identity.

**Live:** https://sik-phi.vercel.app
**npm:** @sik/core · @sik/reputation · @sik/auth · @sik/agent · @sik/credentials

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
import { getIdentity } from "@sik/core"

const identity = await getIdentity("example.sol", connection)

identity.profile        // avatar, social links, bio
identity.reputation     // 0–100 score, computed from on-chain activity
identity.credentials    // SAS-verified attestations from trusted issuers
```

For agents:

```typescript
import { getAgentIdentity } from "@sik/agent"

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

Give your agent a `.sol` name.
Register its capabilities on-chain.
Any protocol that uses SIK can verify your agent before granting access —
without you having to negotiate trust manually with each integration.

An agent with a SIK identity is a trustworthy agent by default.

---

## Packages

| Package | What it does |
|---|---|
| `@sik/core` | `getIdentity()` — profile + reputation + credentials |
| `@sik/reputation` | On-chain reputation scoring engine |
| `@sik/auth` | Sign In with .sol — authenticated identity sessions |
| `@sik/agent` | Agent identity — capabilities, trust, operator |
| `@sik/credentials` | SAS credential integration |

```bash
npm install @sik/core @sik/reputation
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

## Built at Colosseum Frontier Hackathon 2026
SNS Identity Track · Social Identity + Agent Identity
```

---

## Part 2: Landing Page (`/`)

The landing page must speak to two audiences in 5 seconds each.
Developers. Agent builders. In that order.

### Hero Section

```
┌─────────────────────────────────────────────┐
│                                             │
│   ENS gives you a name.                    │
│   SIK gives you an identity.               │
│                                             │
│   Profile. Reputation. Credentials.        │
│   For humans and agents.                   │
│                                             │
│   [ Look up any .sol ]  [ Sign In with .sol ] │
│                                             │
└─────────────────────────────────────────────┘
```

### Two Cards Below Hero

```
┌──────────────────────┐  ┌──────────────────────┐
│  👤 Human Identity   │  │  🤖 Agent Identity   │
│                      │  │                      │
│  Sign in with .sol   │  │  Give your agent a   │
│  Portable reputation │  │  .sol identity with  │
│  Verifiable creds    │  │  on-chain trust      │
│                      │  │                      │
│  [Try bonfida.sol →] │  │  [Try agent demo →]  │
└──────────────────────┘  └──────────────────────┘
```

### Developer Code Block

Below the two cards — a code snippet that shows the SDK in 4 lines:

```tsx
<div className="code-demo">
  <div className="code-demo-label">Any app. One call.</div>
  <pre>
{`import { getIdentity } from "@sik/core"

const identity = await getIdentity("example.sol", connection)
// identity.profile · identity.reputation · identity.credentials`}
  </pre>
  <div className="code-demo-npm">npm install @sik/core</div>
</div>
```

---

## Part 3: Identity Page (`/[domain]`)

Current page is good. Three additions only:

### Addition 1: "Powered by SIK" badge
Top right corner. Small. Links to GitHub.
```
Built with SIK · github.com/thewoodfish/sik
```

### Addition 2: Developer callout below the card
```
┌─────────────────────────────────────────┐
│  Integrate this identity in your app:   │
│                                         │
│  getIdentity("bonfida.sol", connection) │
│                           [Copy]        │
└─────────────────────────────────────────┘
```
One line. Copy button. Instantly shows dapp devs the value.

### Addition 3: Credentials section
Replace "No credentials yet" stub with the real SAS component.
If no credentials exist for this wallet — show:
```
No on-chain credentials yet.
Credentials issued via the Solana Attestation Service appear here.
```
NOT "SIK-2 coming soon" — that signals incomplete. 
"Issued via SAS" signals live infrastructure.

---

## Part 4: Agent Identity Page (`/agent/[domain]`)

This page does not exist yet. It is the most important page to add.
It is what answers "building the future."

### Visual Layout

```
┌─────────────────────────────────────────────┐
│  🤖  AGENT IDENTITY                        │
│                                             │
│  myagent.sol                               │
│  7Vz3...k9Qp                               │
│                                             │
│  Operated by: thewoodfish.sol              │
│                                             │
│  Capabilities:                              │
│  [payments] [web_search] [trading]         │
│                                             │
│  Trust Score: 74 / 100                     │
│  ████████████████░░░░░░░                   │
│                                             │
│  Operator Reputation    ████░░  18/30      │
│  Tx Consistency         █████░  21/25      │
│  Authorization Depth    ███░░░  15/25      │
│  Program Specialization ████░░  20/20      │
│                                             │
│  Credentials                               │
│  ✅ Authorized by Superteam               │
│  ✅ KYC Verified — Civic                  │
│                                             │
│  Last Active: 2 hours ago                  │
│  Registered: March 2026                    │
└─────────────────────────────────────────────┘
```

### For the Demo

You need at least one real agent identity to show.
Create a demo agent wallet. Register it with a `.sol` name on devnet.
Set SNS Record.Url to a fake endpoint.
Set SNS Record.Github to your codemon repo.
Call `getAgentIdentity()` and confirm the page loads.

Use YOUR wallet as the operator — so `thewoodfish.sol` appears
as the operator. That connects the human and agent identity layers
visually in one screen.

---

## Part 5: DAO Gate Demo (`/demo/dao-gate`)

This page already exists. Two changes:

**Change 1: Add an agent tab**
```
[ Human Identity ]  [ Agent Identity ]
```

Human tab: enter a `.sol` name, check reputation threshold.
Agent tab: enter a `.sol` name, check capabilities + trust score.

```
Agent Gate Demo:
Enter agent domain: [myagent.sol        ] [Check]

✅ Trust Score: 74/100 — meets threshold (70)
✅ Has capability: payments
✅ Access granted
```

**Change 2: Show the code**
Below the gate result, show the 4 lines of code that produced it.
Judges are developers. Showing the code is showing the value.

---

## Part 6: Submission Text

**Project name:** SIK — Solana Identity Kit

**One-liner:**
The identity primitive for humans and agents on Solana —
profile, reputation, credentials, and trust in one SDK call.

**Full description:**

Every AI agent that acts on-chain needs an identity that protocols
can trust before granting access. Every Solana app that needs to know
who a user is rebuilds the same identity logic from scratch.
SIK solves both with a single, composable protocol built on SNS.

**For agents:** `getAgentIdentity("agent.sol")` returns the agent's
operator, capabilities, trust score, and SAS credentials — everything
a protocol needs to decide whether to trust an autonomous system.
An agent's trust is computed from on-chain behaviour: transaction
consistency, program specialization, operator reputation, and
authorization depth. Not from its creator's word.

**For humans:** `getIdentity("name.sol")` returns profile, a reputation
score computed entirely from on-chain activity, and verifiable
credentials via the Solana Attestation Service. `signIn()` from
`@sik/auth` gives any app a standardised `.sol` login session in
3 lines. No custom identity logic required.

**Why not ENS:** ENS gives you a name. SIK gives you an identity —
one that changes based on what you do, gates access based on what
you've earned, and works for machines as well as humans.
Solana-native, sub-second resolution, open-source, composable.

Five packages. One protocol. Live today.

**Live:** https://sik-phi.vercel.app
**GitHub:** https://github.com/thewoodfish/sik
**Packages:** @sik/core · @sik/reputation · @sik/auth · @sik/agent · @sik/credentials

---

## Execution Order (8 Hours)

**Hour 1-2**
- Rewrite README exactly as above
- Update landing page: new hero, two cards, code block

**Hour 2-4**
- Build `/agent/[domain]` page with AgentCard component
- Create demo agent wallet, register `.sol` name, test page loads

**Hour 4-5**
- Add developer callout to `/[domain]` page
- Add agent tab to `/demo/dao-gate`
- Fix credentials empty state text

**Hour 5-6**
- Publish all 5 npm packages
- Deploy to Vercel
- Smoke test every page: `/`, `/bonfida.sol`,
  `/agent/[domain]`, `/demo/dao-gate`

**Hour 6-7**
- Record demo video (screen record, no voiceover needed)
  Show: landing → bonfida.sol → agent page → dao gate
  2 minutes maximum
- Fill Colosseum submission form
- Paste submission text above

**Hour 7-8**
- Buffer for broken things
- Submit

---

## Definition of Done

- [ ] README leads with agent identity, not "identity standard"
- [ ] Landing page has two cards: human + agent
- [ ] `/agent/[domain]` page exists and loads with real data
- [ ] Developer callout on `/[domain]` page
- [ ] Agent tab on DAO gate demo
- [ ] Credentials show "issued via SAS" not "SIK-2 coming"
- [ ] All 5 packages published to npm
- [ ] Vercel deploy green
- [ ] Submission filed