# CLAUDE.md — SIK (Solana Identity Kit)

## Project Identity

**Repo:** `sik`
**npm scope:** `@sik/core`, `@sik/reputation`, `@sik/dashboard`
**Standard description:**
> SIK is an open identity standard built on SNS. It gives every `.sol` name a
> structured identity primitive — profile, reputation, and credentials — that
> any Solana app can integrate with a single function call instead of building
> identity from scratch.

**Hackathon:** SNS Identity Track, Colosseum Frontier Hackathon
**Deadline:** May 11, 2026 (Colosseum submission) | Demo Day: May 14
**Prize target:** $1,800 (1st place)

---

## The One Sentence That Must Be True of Every Decision

> SIK is not a profile page. It is the identity primitive that every Solana
> app has been rebuilding independently, now standardised.

If a feature makes SIK look like an app, reconsider it.
If a feature makes SIK look like infrastructure, build it.

---

## What to Ship for the Hackathon (9 Days)

### Must Ship
1. **`@sik/core`** — `getIdentity(domain, connection)` — the core SDK function
2. **Reputation scoring** — computed from on-chain signals, the novel piece
3. **Identity Dashboard** — the reference implementation / demo surface

### Stub Only (document the interface, do not implement)
- Credentials & attestations layer — needs on-chain program, out of scope
- ZK selective disclosure — too complex, stub the type surface only
- Third-party credential issuers — document the interface spec

### Do Not Build
- Anything that requires a new on-chain program deployment
- Any token or payment mechanic
- Mobile app

---

## Monorepo Structure

```
sik/
  packages/
    core/           # @sik/core — getIdentity(), types, SNS resolution
    reputation/     # @sik/reputation — scoring engine
    dashboard/      # @sik/dashboard — Next.js reference app
  docs/
    SIK-1.md        # Protocol spec draft (for grant path)
  README.md
  package.json      # pnpm workspace
```

---

## Package: `@sik/core`

### The Core API

```typescript
import { getIdentity } from "@sik/core";

const identity = await getIdentity("example.sol", connection);
```

### Identity Object Shape

```typescript
export interface SIKIdentity {
  // Resolution
  domain: string;                    // "example.sol"
  owner: string;                     // wallet address (base58)

  // Profile — from SNS Records V2
  profile: {
    avatar: string | null;           // Record.Pic
    twitter: string | null;          // Record.Twitter
    github: string | null;           // Record.Github
    discord: string | null;          // Record.Discord
    telegram: string | null;         // Record.Telegram
    url: string | null;              // Record.Url
    email: string | null;            // Record.Email
    backpack: string | null;         // Record.Backpack
  };

  // Reputation — computed, the novel piece
  reputation: {
    score: number;                   // 0–100
    breakdown: ReputationBreakdown;
    computedAt: number;              // unix timestamp
  };

  // Credentials — stubbed for now
  credentials: Credential[];        // always [] in hackathon build

  // Meta
  fetchedAt: number;
}

export interface ReputationBreakdown {
  accountAge: number;               // 0–20 points
  transactionVolume: number;        // 0–20 points
  programDiversity: number;         // 0–20 points
  daoParticipation: number;         // 0–20 points
  solBalance: number;               // 0–10 points
  nftHoldings: number;              // 0–10 points
}

// Stub types for future layers
export interface Credential {
  id: string;
  issuer: string;
  type: string;
  issuedAt: number;
  data: Record<string, unknown>;
}
```

### SNS Resolution Implementation

Use `@bonfida/spl-name-service` — do not reimplement SNS resolution.

```typescript
import {
  resolve,
  getRecordV2,
  Record,
} from "@bonfida/spl-name-service";
import { Connection } from "@solana/web3.js";

// Resolve domain → owner
const ownerPublicKey = await resolve(connection, "example"); // no .sol suffix

// Fetch a record
const twitterRecord = await getRecordV2(connection, "example", Record.Twitter);
const avatarRecord  = await getRecordV2(connection, "example", Record.Pic);
const githubRecord  = await getRecordV2(connection, "example", Record.Github);
```

**Important:** Records V2 returns a staleness flag. Check `stale` before
using the value. If stale, return `null` for that field — do not serve
stale identity data.

**Records to fetch for profile:**
`Pic`, `Twitter`, `Github`, `Discord`, `Telegram`, `Url`, `Email`, `Backpack`

Fetch all records in parallel with `Promise.allSettled` — never serial.
Handle `null` gracefully — most records won't be set.

---

## Package: `@sik/reputation`

### Scoring Philosophy

The reputation score is the novel differentiator. No one has done this on
SNS. It must feel meaningful, not arbitrary. Every point must be explainable.

Score range: **0–100**. Computed entirely from public on-chain data.
No off-chain data. No oracles. Reproducible by anyone with an RPC.

### Signal Breakdown

| Signal | Max Points | Data Source |
|---|---|---|
| Account age | 20 | First transaction timestamp |
| Transaction volume | 20 | `getSignaturesForAddress` count |
| Program diversity | 20 | Unique programs interacted with |
| DAO participation | 20 | Governance program interactions |
| SOL balance | 10 | `getBalance` |
| NFT holdings | 10 | Token accounts with supply=1 |
| **Total** | **100** | |

### Scoring Implementation

```typescript
export async function computeReputation(
  owner: PublicKey,
  connection: Connection
): Promise<ReputationBreakdown> {

  const [signatures, balance, tokenAccounts] = await Promise.all([
    connection.getSignaturesForAddress(owner, { limit: 1000 }),
    connection.getBalance(owner),
    connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID }),
  ]);

  return {
    accountAge:        scoreAccountAge(signatures),
    transactionVolume: scoreTransactionVolume(signatures.length),
    programDiversity:  scoreProgramDiversity(signatures),
    daoParticipation:  scoreDaoParticipation(signatures),
    solBalance:        scoreSolBalance(balance),
    nftHoldings:       scoreNftHoldings(tokenAccounts),
  };
}
```

### Scoring Functions

**accountAge (0–20):**
- Take the oldest signature's `blockTime`
- Age in days: `(now - oldestBlockTime) / 86400`
- 0 pts = 0 days, 20 pts = 365+ days, linear interpolation

**transactionVolume (0–20):**
- 0 pts = 0 txns, 20 pts = 500+ txns, log scale
- `Math.min(20, Math.floor(Math.log10(count + 1) * 8.68))`

**programDiversity (0–20):**
- Count unique program IDs across all signatures
- Exclude system program and token program (too common)
- 0 pts = 0 unique, 20 pts = 20+ unique programs

**daoParticipation (0–20):**
- Known governance program IDs to check against signatures:
  - SPL Governance: `GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw`
  - Realms: check interactions with known DAO programs
- 5 pts per confirmed governance interaction, max 20

**solBalance (0–10):**
- 0 pts = 0 SOL, 10 pts = 10+ SOL, linear
- `Math.min(10, Math.floor(balance / LAMPORTS_PER_SOL))`

**nftHoldings (0–10):**
- Count token accounts where `amount === 1` and `decimals === 0`
- 0 pts = 0 NFTs, 10 pts = 10+ NFTs, linear

### Performance

Reputation computation hits the RPC multiple times. Cache aggressively.
Default TTL: 1 hour. Expose cache configuration to callers.

```typescript
const identity = await getIdentity("example.sol", connection, {
  cache: true,
  cacheTTL: 3600_000, // 1 hour in ms
});
```

---

## Package: `@sik/dashboard`

### Stack

- **Next.js 14** (App Router)
- **@solana/wallet-adapter-react** for wallet connection
- **@bonfida/sns-react** for domain detection (`useDomainsForOwner`)
- **Tailwind CSS**
- **shadcn/ui** components

### Pages

```
app/
  page.tsx              # Landing — connect wallet
  [domain]/
    page.tsx            # Identity view for any .sol name
  dashboard/
    page.tsx            # Authenticated user's own identity management
```

### Key Components

**`<IdentityCard domain="example.sol" />`**
The shareable identity component any app can embed. Shows avatar, domain,
reputation score, social links. This is the demo-able surface.

**`<ReputationBreakdown score={score} breakdown={breakdown} />`**
Bar chart showing each signal's contribution. Makes the score feel
legitimate and transparent.

**`<ProfileEditor />`**
Connect wallet → detect .sol names → set default identity → edit metadata.
Writes back to SNS Records V2.

**`<CredentialList credentials={[]} />`**
Empty state with clear "coming in SIK-2" messaging. Plant the seed for
the next grant component.

### Wallet Detection Flow

```typescript
// Detect all .sol names owned by connected wallet
import { useDomainsForOwner } from "@bonfida/sns-react";

const { result: domains } = useDomainsForOwner(connection, publicKey);
// Returns string[] of domain names without .sol suffix
```

---

## What Makes This Win the Hackathon

### The Demo Day Pitch (2 minutes)

1. Open `bonfida.sol` in the dashboard — show a real SNS name with a
   populated identity profile
2. Show the reputation score breakdown — "this is computed entirely
   from on-chain data, no oracles, reproducible by anyone"
3. Open the code — show `getIdentity("bonfida.sol", connection)` — 
   "any app integrates identity with one line"
4. Show the stub credentials section — "this is SIK-2, which we are
   applying for grant funding to build"

### The Differentiator to Hammer

Every judge knows SNS has profile records. The question they will ask
silently is: "how is this different from just reading SNS records?"

The answer is the reputation score. SNS has no reputation primitive.
SIK invents one. That is the novel contribution. Lead with it always.

---

## Codebase Rules

- TypeScript strict mode everywhere
- No `any` types — if you need `unknown`, use `unknown`
- Every public function has JSDoc
- `Promise.allSettled` for parallel RPC calls — never let one failed
  record fetch break the whole identity resolution
- Graceful degradation: partial identity is better than an error
- RPC calls are expensive — batch where possible, cache always

---

## Dependencies

```json
{
  "@bonfida/spl-name-service": "latest",
  "@bonfida/sns-react": "latest",
  "@solana/web3.js": "^1.95.0",
  "@solana/wallet-adapter-react": "latest",
  "@solana/wallet-adapter-wallets": "latest",
  "@solana/spl-token": "latest"
}
```

Use web3.js v1, not kit. `@bonfida/spl-name-service` depends on v1.
Do not mix.

---

## The Grant Path (Document This in the README)

SIK is designed as a protocol with independently fundable components.

| Component | Status | Grant Target |
|---|---|---|
| SIK-1: Core SDK + Reputation | ✅ Hackathon build | Done |
| SIK-2: Credentials & Attestations | 🔲 Stubbed | Superteam Grant Round 2 |
| SIK-3: Selective Disclosure | 🔲 Spec only | Solana Foundation Grant |
| SIK-4: App Integrations | 🔲 Future | SNS Direct Grant |

Include this table in the README. It signals that SIK is a roadmap,
not a one-off project. Grant committees fund roadmaps differently
than they fund apps.

---

## SIK-1 Protocol Spec (docs/SIK-1.md)

Write a one-page spec. It does not need to be perfect. It needs to exist.

Cover:
- The `SIKIdentity` type definition (canonical)
- The resolution algorithm (SNS → owner → records → reputation)
- The reputation scoring formula (each signal, weight, range)
- The credential interface (even if empty for now)
- Versioning strategy (SIK-1, SIK-2, etc.)

Filing a spec document is what separates a hackathon project from
a standard. Do this on Day 1, refine it as you build.

---

## Submission Checklist

- [ ] `getIdentity()` works on mainnet with a real .sol name
- [ ] Reputation score is non-zero and explainable for a real wallet
- [ ] Dashboard deployed (Vercel) — live URL for Demo Day
- [ ] GitHub repo is public with clean README
- [ ] `SIK-1.md` spec exists in `/docs`
- [ ] Credentials section shows as "coming in SIK-2" — not hidden
- [ ] Colosseum submission before May 11
- [ ] Superteam Earn submission before the track deadline
- [ ] Demo Day preparation: working mainnet demo, 2-minute pitch ready
