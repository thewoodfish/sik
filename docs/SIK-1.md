# SIK-1: Solana Identity Kit — Protocol Specification

**Version:** 1.0.0-draft  
**Status:** Active (Hackathon Build)  
**Authors:** thewoodfish

---

## Abstract

SIK-1 defines the `SIKIdentity` type, the resolution algorithm, and the
reputation scoring formula that together constitute the first version of the
Solana Identity Kit protocol. SIK is an open identity primitive built on top
of SNS (Solana Name Service) that any Solana application can integrate with a
single function call.

---

## 1. The `SIKIdentity` Type

The canonical identity object returned by `getIdentity()`.

```typescript
interface SIKIdentity {
  domain: string;          // "example.sol"
  owner: string;           // wallet address (base58)

  profile: {
    avatar:   string | null;   // SNS Record.Pic
    twitter:  string | null;   // SNS Record.Twitter
    github:   string | null;   // SNS Record.Github
    discord:  string | null;   // SNS Record.Discord
    telegram: string | null;   // SNS Record.Telegram
    url:      string | null;   // SNS Record.Url
    email:    string | null;   // SNS Record.Email
    backpack: string | null;   // SNS Record.Backpack
  };

  reputation: {
    score:       number;              // 0–100
    breakdown:   ReputationBreakdown;
    computedAt:  number;              // unix timestamp (ms)
  };

  credentials: Credential[];  // always [] in SIK-1

  fetchedAt: number;          // unix timestamp (ms)
}
```

---

## 2. Resolution Algorithm

```
getIdentity(domain, connection)
  │
  ├── 1. Normalise domain → strip .sol suffix
  ├── 2. resolve(connection, domain) → owner PublicKey   [SNS]
  ├── 3. Parallel fetch (Promise.allSettled):
  │       getRecordV2(domain, Record.Pic)
  │       getRecordV2(domain, Record.Twitter)
  │       getRecordV2(domain, Record.Github)
  │       getRecordV2(domain, Record.Discord)
  │       getRecordV2(domain, Record.Telegram)
  │       getRecordV2(domain, Record.Url)
  │       getRecordV2(domain, Record.Email)
  │       getRecordV2(domain, Record.Backpack)
  │   → null if stale, null if missing
  ├── 4. computeReputation(owner, connection) → ReputationBreakdown
  └── 5. Assemble SIKIdentity, cache, return
```

**Invariants:**
- A single failed record fetch never breaks identity resolution.
- Stale records (SNS Records V2 `stale` flag) are treated as `null`.
- The function resolves or throws — it never returns partial data without raising.

---

## 3. Reputation Scoring Formula

All data sourced from public on-chain state. No oracles. Fully reproducible.

### 3.1 Signal Weights

| Signal | Max Points | Source |
|---|---|---|
| Account Age | 20 | First transaction `blockTime` |
| Transaction Volume | 20 | `getSignaturesForAddress` count |
| Program Diversity | 20 | Unique program IDs |
| DAO Participation | 20 | Governance program interactions |
| SOL Balance | 10 | `getBalance` |
| NFT Holdings | 10 | Token accounts with supply=1 |
| **Total** | **100** | |

### 3.2 Scoring Functions

**Account Age (0–20)**
```
ageInDays = (now - oldestSignature.blockTime) / 86400
score     = min(20, floor((ageInDays / 365) * 20))
```

**Transaction Volume (0–20)**
```
score = min(20, floor(log10(count + 1) × 8.68))
```
Reaches 20 at ~500 transactions.

**Program Diversity (0–20)**
```
// Exclude: SystemProgram, SPL Token, ATA, ComputeBudget
score = min(20, count_of_unique_non_noise_programs)
```

**DAO Participation (0–20)**
```
// Known governance programs: SPL Governance, Realms
score = min(20, governance_interactions × 5)
```

**SOL Balance (0–10)**
```
score = min(10, floor(lamports / LAMPORTS_PER_SOL))
```

**NFT Holdings (0–10)**
```
nfts  = token_accounts where amount=1 AND decimals=0
score = min(10, count_of_nfts)
```

### 3.3 Total Score
```
total = accountAge + transactionVolume + programDiversity
      + daoParticipation + solBalance + nftHoldings
```

---

## 4. Credential Interface (Stub)

The credential type is defined in SIK-1 but always returns `[]`.
Full implementation in SIK-2.

```typescript
interface Credential {
  id:       string;
  issuer:   string;           // issuer wallet address
  type:     string;           // e.g. "KYC", "Github", "ENS"
  issuedAt: number;           // unix timestamp
  data:     Record<string, unknown>;
}
```

### Planned SIK-2 Architecture

- On-chain program: issuers submit signed credential accounts
- Identity resolution includes credential accounts owned by the domain
- ZK selective disclosure: SIK-3 (Solana Foundation Grant target)

---

## 5. Versioning

| Version | Status | Description |
|---|---|---|
| SIK-1 | Active | Core SDK + Reputation scoring |
| SIK-2 | Planned | Credentials & on-chain attestations |
| SIK-3 | Spec | ZK selective disclosure |
| SIK-4 | Future | App integration SDKs |

Backwards compatibility: `SIKIdentity.credentials` is always a valid array.
Apps depending on `[]` today will receive populated data in SIK-2 with no
interface change.

---

## 6. Caching

The reference implementation caches identity objects in-memory with a
configurable TTL (default: 1 hour). Callers can override:

```typescript
const identity = await getIdentity("example.sol", connection, {
  cache: true,
  cacheTTL: 3_600_000,  // 1 hour in ms
});
```

Cache invalidation is caller-controlled. Pass `cache: false` to bypass.

---

## 7. References

- [SNS Records V2](https://docs.sns.id/records)
- [Bonfida SPL Name Service](https://github.com/Bonfida/spl-name-service)
- [SPL Governance](https://github.com/solana-labs/solana-program-library/tree/master/governance)
- [Solana RPC API](https://docs.solana.com/api)
