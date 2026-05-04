# CLAUDE.md — SIK v2 (Winning the Hackathon)

## Status

V1 is complete. All three packages exist and compile:
- `@sik/core` — getIdentity(), SNS resolution, caching
- `@sik/reputation` — scoring engine, breakdown
- `@sik/dashboard` — Next.js 14, all 6 components, wallet provider

V2 is not about building more features.
V2 is about the gap between "works" and "wins".

---

## The 7 Judging Criteria — Honest Gap Analysis

| Criterion | V1 Status | Gap |
|---|---|---|
| Innovation | Strong — reputation scoring is novel | Add MagicBlock real-time updates |
| Technical Merit | Strong — clean monorepo, compiled | Publish npm packages |
| Practicality | Good — use cases documented | Add one real app integration demo |
| Completeness | Strong — all components exist | Deploy to Vercel, live URL |
| User Experience | Unknown — needs review | Polish [domain] page, mobile |
| Founder Potential | Weak — no roadmap visible in product | Add SIK-2 stub + roadmap to README |
| Demo Quality | Not started | Write and record demo script |

V2 closes every gap above. In order of priority.

---

## Priority 1 — Deploy to Vercel (Do This First)

Judges need a live URL. Everything else is secondary to this.

```bash
cd packages/dashboard
vercel --prod
```

Set environment variables in Vercel dashboard:
```
NEXT_PUBLIC_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

Target URL: `sik.vercel.app` or `solana-identity-kit.vercel.app`

Test immediately after deploy:
- Navigate to `/bonfida` — identity card must load
- Reputation score must be non-zero
- All social links must resolve or show null gracefully

**The live URL goes in every submission field that accepts text.**

---

## Priority 2 — Polish the [domain] Page

This is the Demo Day surface. Judges will type `sik.vercel.app/bonfida`
and judge the entire project in 10 seconds.

### It must have:
- Avatar (from SNS Pic record, fallback to generated gradient avatar)
- Domain name large and prominent: `bonfida.sol`
- Wallet address truncated: `7Vz3...k9Qp`
- Social links as icon buttons (Twitter, GitHub, Discord, Telegram)
- Reputation score as a large number with a label: "Reputation Score"
- Breakdown as a horizontal bar chart — one bar per signal
- Each bar labeled and showing its points: "Account Age — 18/20"
- Credentials section: empty state with "SIK-2 coming soon" message
- Share button: copies `sik.vercel.app/bonfida` to clipboard

### Visual standard:
Dark background. Clean typography. Not a crypto app aesthetic —
think Linear or Vercel's own dashboard. Judges are developers.
They will notice if it looks like a hackathon project.

### Mobile:
Must be readable on mobile. Judges may check on their phones.
Stack the reputation breakdown vertically on small screens.

---

## Priority 3 — MagicBlock Integration (The $700 Bonus)

MagicBlock is a co-sponsor. Not integrating their tech leaves $700 on the table
and signals you didn't read the brief.

MagicBlock builds real-time on-chain state using ephemeral rollups.
The integration angle for SIK: **live reputation updates**.

### What to build:
When a user is viewing an identity page, the reputation score
refreshes in real-time as new transactions land — without page reload.

```typescript
// In [domain]/page.tsx
import { useRealtimeReputation } from '@sik/reputation';

// Polls every 30s using MagicBlock's real-time infrastructure
const { score, breakdown, lastUpdated } = useRealtimeReputation(owner, connection);
```

### Implementation:
MagicBlock's real-time layer uses WebSocket subscriptions.
Wire `onAccountChange` for the wallet address to trigger a
reputation recompute when new transactions are detected.
Show a subtle "Updated just now" label when it refreshes.

Even a basic implementation that re-fetches on account change
is enough to legitimately claim the MagicBlock integration.

### In the submission:
Mention MagicBlock explicitly:
> "SIK uses MagicBlock's real-time infrastructure to keep reputation
> scores live — when a new transaction lands, the score updates
> without a page refresh."

---

## Priority 4 — Publish npm Packages

Published packages signal that SIK is real infrastructure, not a hackathon toy.

```bash
# In packages/core
npm publish --access public

# In packages/reputation  
npm publish --access public
```

Make sure package.json names are:
- `@sik/core`
- `@sik/reputation`

After publishing, the README integration example becomes real:
```bash
npm install @sik/core @sik/reputation
```

This one command in the README, linking to real npm packages,
changes how judges perceive the entire project.

---

## Priority 5 — The App Integration Demo

The single biggest differentiator between "we built a profile page"
and "we built infrastructure" is showing another app consuming SIK.

Build a minimal second page: `/demo/dao-gate`

```
┌─────────────────────────────────────┐
│  DAO Access Gate — Powered by SIK   │
│                                     │
│  Enter a .sol name to check access: │
│  [bonfida.sol          ] [Check]    │
│                                     │
│  ✅ Reputation score: 87/100        │
│  ✅ Meets minimum threshold (70)    │
│  ✅ Access granted                  │
│                                     │
│  Built with: getIdentity("bonfida") │
│  3 lines of code                    │
└─────────────────────────────────────┘
```

This demo exists to prove one thing: apps use SIK as infrastructure.
The "3 lines of code" label makes the developer value proposition
instantly legible to judges who are also developers.

---

## Priority 6 — README Rewrite

The README is what judges read before clicking the live URL.
Current README needs these sections in this order:

### 1. The one-liner
> The identity layer for Solana. Turn any `.sol` name into a portable,
> programmable identity any app can read.

### 2. Live demo link
> **Live:** https://sik.vercel.app

### 3. The integration (30 seconds to understand)
```typescript
import { getIdentity } from "@sik/core";

const identity = await getIdentity("bonfida.sol", connection);

console.log(identity.reputation.score);     // 87
console.log(identity.profile.twitter);      // "@bonfida"
console.log(identity.credentials);          // [] — SIK-2 coming
```

### 4. Why it exists (3 sentences max)
Every Solana app that needs identity — DAOs, marketplaces, freelance
platforms — builds the same profile + reputation logic from scratch.
SIK standardises it. One SDK, one call, portable across every app.

### 5. The roadmap table
| Version | Component | Status |
|---|---|---|
| SIK-1 | Core SDK + Reputation Layer | ✅ Live |
| SIK-2 | Credentials & Attestations | 🔲 Grant application in progress |
| SIK-3 | Selective Disclosure (ZK) | 🔲 Planned |
| SIK-4 | Ecosystem Integrations | 🔲 Planned |

### 6. Packages
- `@sik/core` — npm link
- `@sik/reputation` — npm link

### 7. Contributing / contact

---

## Priority 7 — Demo Script (For Demo Day, May 14)

Prepare this. Know it cold. 2 minutes maximum.

**[0:00–0:20] The problem**
> "Every Solana app that needs to know who a user is builds the same
> thing from scratch — profile data, reputation, trust signals.
> There's no standard. SIK is that standard."

**[0:20–0:40] The API**
> "Any app integrates identity with one function call."
> [Show code: `const identity = await getIdentity("bonfida.sol", connection)`]
> "You get profile, reputation score, and credentials. Structured.
> Portable. No rebuilding."

**[0:40–1:10] The live demo**
> [Open sik.vercel.app/bonfida]
> "This is bonfida.sol's identity. Reputation score computed entirely
> from on-chain data — account age, transaction history, program
> diversity, DAO participation. No oracles. Reproducible by anyone."
> [Point at the breakdown chart]
> "Every point is explainable. This is SIK-1."

**[1:10–1:30] The use case**
> [Open /demo/dao-gate]
> "A DAO gates access by reputation score. Three lines of code.
> That's what infrastructure looks like."

**[1:30–1:50] The roadmap**
> "SIK-1 is the core and reputation layer — shipped today.
> SIK-2 is verifiable credentials and attestations — grant application
> goes in this week. SIK-3 is ZK selective disclosure.
> We are not done when this submission closes."

**[1:50–2:00] Close**
> "SIK is to identity what SPL Token is to fungible tokens.
> A standard that every app builds on top of."

---

## Submission Text (Copy-Paste Ready)

**Project name:** SIK — Solana Identity Kit

**One-liner:** The identity standard for Solana — turn any .sol name
into a portable, programmable identity any app can read.

**Description:**
SIK is an open-source SDK and protocol that extends SNS `.sol` names
into a full identity layer for the Solana ecosystem. Any app calls
`getIdentity("name.sol")` and receives a structured identity object
containing profile metadata, a reputation score computed entirely from
on-chain activity, and a credentials interface ready for SIK-2.

The reputation layer is the novel contribution: a 0–100 score computed
from account age, transaction volume, program diversity, DAO participation,
SOL balance, and NFT holdings — no oracles, no off-chain data,
reproducible by anyone with an RPC connection.

SIK is not an app. It is infrastructure. The dashboard is the reference
implementation that proves the SDK works. The real product is
`@sik/core` and `@sik/reputation` — open-source packages any Solana
developer installs and uses.

SIK-1 (core + reputation) ships with this hackathon. SIK-2 (credentials
and attestations) is scoped for a Superteam grant application immediately
after. SIK-3 (ZK selective disclosure) follows. The standard is in progress.

**Live URL:** https://sik.vercel.app
**GitHub:** https://github.com/thewoodfish/sik
**npm:** @sik/core | @sik/reputation

---

## Definition of Done for V2

- [ ] Deployed to Vercel, live URL working
- [ ] `/bonfida` loads with real reputation score
- [ ] Reputation breakdown chart visible and accurate
- [ ] MagicBlock real-time refresh wired
- [ ] `/demo/dao-gate` page exists
- [ ] `@sik/core` published to npm
- [ ] `@sik/reputation` published to npm
- [ ] README rewritten per structure above
- [ ] Demo script memorised
- [ ] Colosseum submission filed before May 11
- [ ] Superteam Earn submission filed