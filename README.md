# SIK — Solana Identity Kit

> The identity primitive every Solana app has been rebuilding independently — now standardised.

SIK gives every `.sol` name a structured identity primitive — profile, reputation, and credentials — that any Solana app can integrate with a single function call instead of building identity from scratch.

```typescript
import { getIdentity } from "@sik/core";

const identity = await getIdentity("bonfida.sol", connection);
// { domain, owner, profile, reputation: { score, breakdown }, credentials }
```

---

## Why SIK

Every Solana app that wants to show a user's identity does the same thing: resolve their SNS domain, fetch whatever records exist, try to derive something meaningful. SIK standardises that pattern and adds the one piece SNS doesn't have: **reputation scoring**.

The reputation score (0–100) is computed entirely from public on-chain signals — account age, transaction volume, program diversity, DAO participation, SOL balance, NFT holdings. No oracles. Reproducible by anyone with an RPC endpoint.

---

## Packages

| Package | Description |
|---|---|
| [`@sik/core`](packages/core) | `getIdentity()` — the single integration point |
| [`@sik/reputation`](packages/reputation) | On-chain reputation scoring engine |
| [`@sik/dashboard`](packages/dashboard) | Next.js reference app and demo surface |

---

## Quick Start

```bash
pnpm install
pnpm build       # build core and reputation
pnpm dev         # start dashboard on localhost:3000
```

### Using `@sik/core` in your app

```bash
npm install @sik/core @solana/web3.js
```

```typescript
import { Connection } from "@solana/web3.js";
import { getIdentity } from "@sik/core";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const identity = await getIdentity("example.sol", connection);

console.log(identity.reputation.score);       // 0–100
console.log(identity.profile.twitter);        // "@handle" or null
console.log(identity.reputation.breakdown);   // per-signal scores
```

---

## Reputation Scoring

| Signal | Max | Source |
|---|---|---|
| Account age | 20 | Age of oldest transaction |
| Transaction volume | 20 | Log-scaled tx count |
| Program diversity | 20 | Unique programs interacted with |
| DAO participation | 20 | Governance program interactions |
| SOL balance | 10 | Current SOL holdings |
| NFT holdings | 10 | Token accounts with supply=1 |
| **Total** | **100** | |

All signals are sourced from public on-chain state. See [docs/SIK-1.md](docs/SIK-1.md) for the full scoring formula.

---

## Protocol Roadmap

SIK is designed as a protocol with independently fundable components.

| Component | Status | Grant Target |
|---|---|---|
| SIK-1: Core SDK + Reputation | ✅ Complete | — |
| SIK-2: Credentials & Attestations | 🔲 Stubbed | Superteam Grant Round 2 |
| SIK-3: Selective Disclosure | 🔲 Spec only | Solana Foundation Grant |
| SIK-4: App Integrations | 🔲 Future | SNS Direct Grant |

The credential interface (`identity.credentials`) is defined and always returns `[]` in SIK-1. Apps built against SIK-1 will receive populated credentials in SIK-2 with no interface changes.

---

## Protocol Spec

The full SIK-1 specification — type definitions, resolution algorithm, and scoring formula — is in [docs/SIK-1.md](docs/SIK-1.md).

---

## Built for

Colosseum Frontier Hackathon · SNS Identity Track · May 2026
