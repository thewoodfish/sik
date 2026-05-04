# SIK — Solana Identity Kit

The identity layer for Solana. Turn any `.sol` name into a portable, programmable identity any app can read.

**Live:** https://sik.vercel.app · **npm:** `@sik/core` · `@sik/reputation`

---

```typescript
import { getIdentity } from "@sik/core";

const identity = await getIdentity("bonfida.sol", connection);

console.log(identity.reputation.score);     // 44
console.log(identity.profile.twitter);      // "@bonfida" or null
console.log(identity.credentials);          // [] — SIK-2 coming
```

---

## Why it exists

Every Solana app that needs identity — DAOs, marketplaces, freelance platforms — builds the same profile + reputation logic from scratch. SIK standardises it. One SDK, one call, portable across every app.

---

## Packages

| Package | Description |
|---|---|
| [`@sik/core`](packages/core) | `getIdentity()` — resolve any `.sol` to a full `SIKIdentity` |
| [`@sik/reputation`](packages/reputation) | On-chain reputation scoring engine (0–100) |
| [`@sik/dashboard`](packages/dashboard) | Next.js reference app and demo surface |

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

## Protocol Roadmap

| Version | Component | Status |
|---|---|---|
| SIK-1 | Core SDK + Reputation Layer | ✅ Live |
| SIK-2 | Credentials & Attestations | 🔲 Grant application in progress |
| SIK-3 | Selective Disclosure (ZK) | 🔲 Planned |
| SIK-4 | Ecosystem Integrations | 🔲 Planned |

The credential interface (`identity.credentials`) is defined in SIK-1 and always returns `[]`. Apps built against SIK-1 will receive populated credentials in SIK-2 with no interface changes.

See [docs/SIK-1.md](docs/SIK-1.md) for the full protocol specification.

---

Built for the Colosseum Frontier Hackathon · SNS Identity Track · May 2026
