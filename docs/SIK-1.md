# SIK-1: Solana Identity Kit — Protocol Specification

**Version:** 1.1.0  
**Status:** Active  
**Authors:** thewoodfish

---

## Abstract

SIK-1 defines the `SIKIdentity` and `AgentIdentity` types, the resolution
algorithms for both, the reputation scoring formula for humans, and the trust
scoring formula for agents. Together these constitute the first version of the
Solana Identity Kit protocol — an open identity primitive built on SNS (Solana
Name Service) that any Solana application can integrate with a single function
call.

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

  credentials: SIKCredential[];  // live via SAS

  fetchedAt: number;          // unix timestamp (ms)
}
```

---

## 2. Human Identity Resolution Algorithm

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
  ├── 5. fetchCredentials(owner, connection) → SIKCredential[]
  └── 6. Assemble SIKIdentity, cache, return
```

**Invariants:**
- A single failed record fetch never breaks identity resolution.
- Stale records (SNS Records V2 `stale` flag) are treated as `null`.
- The function resolves or throws — it never returns partial data without raising.

---

## 3. Human Reputation Scoring Formula

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

## 4. The `AgentIdentity` Type

The canonical identity object returned by `getAgentIdentity()`.

```typescript
interface AgentIdentity {
  domain:         string;          // "myagent.sol"
  address:        string;          // agent wallet address (base58)
  operator:       string | null;   // controlling human wallet (base58)
  operatorDomain: string | null;   // controlling human .sol name, if resolved

  profile: {
    url:    string | null;   // SNS Record.Url → agent API endpoint
    github: string | null;   // SNS Record.Github → agent code repository
  };

  capabilities: AgentCapability[];  // derived from SAS credentials

  trustScore:     number;              // 0–100
  trustBreakdown: AgentTrustBreakdown;

  credentials: SIKCredential[];  // SAS attestations held by this agent

  lastActive:    number | null;   // unix timestamp of most recent tx
  registeredAt:  number | null;   // unix timestamp of first tx
}

interface AgentTrustBreakdown {
  operatorReputation:    number;   // 0–30
  transactionConsistency: number;  // 0–25
  authorizationDepth:    number;   // 0–25
  programSpecialization: number;   // 0–20
}

type AgentCapability =
  | "payments"
  | "web_search"
  | "code_execution"
  | "data_access"
  | "trading"
  | "governance"
  | "cross_chain";
```

---

## 5. Agent Identity Resolution Algorithm

```
getAgentIdentity(domain, connection)
  │
  ├── 1. Normalise domain → strip .sol suffix
  ├── 2. resolve(connection, domain) → agent PublicKey   [SNS]
  ├── 3. Parallel fetch:
  │       getRecordV2(domain, Record.Url)     → agent endpoint
  │       getRecordV2(domain, Record.Github)  → agent repo
  ├── 4. getSignaturesForAddress(agentKey, { limit: 100 })
  │       → derive lastActive, registeredAt
  ├── 5. fetchCredentials(agentKey, connection) → SIKCredential[]
  │       → derive capabilities from schema names
  ├── 6. Resolve operator:
  │       SNS Record.Backpack or first-tx fee payer → operator PublicKey
  │       getIdentity(operator, connection) → operatorIdentity
  └── 7. computeAgentTrust(agentKey, operatorIdentity, credentials, connection)
         → AgentTrustBreakdown + trustScore
```

---

## 6. Agent Trust Scoring Formula

### 6.1 Signal Weights

| Signal | Max Points | Source |
|---|---|---|
| Operator Reputation | 30 | Operator's SIK score × 0.30 |
| Transaction Consistency | 25 | Coefficient of variation of inter-tx gaps |
| Authorization Depth | 25 | Count of non-expired SAS credentials |
| Program Specialization | 20 | Concentration of tx volume in top program |
| **Total** | **100** | |

### 6.2 Scoring Functions

**Operator Reputation (0–30)**
```
operatorScore = getIdentity(operator, connection).reputation.score
score         = round(operatorScore / 100 × 30)
```
If no operator is resolvable, score = 0.

**Transaction Consistency (0–25)**
```
gaps  = inter-transaction time deltas (seconds), last 100 txs
cv    = stddev(gaps) / mean(gaps)   // coefficient of variation
score = max(0, round(25 × (1 − min(cv, 1))))
```
Low variance (predictable agent) → higher score.
Fewer than 5 transactions → score = 0.

**Authorization Depth (0–25)**
```
validCredentials = credentials where expired = false
score            = min(25, validCredentials.length × 8)
```

**Program Specialization (0–20)**
```
programCounts = frequency map of programId in last 100 txs
topShare      = max(programCounts.values()) / sum(programCounts.values())
score         = round(topShare × 20)
```
An agent that exclusively uses one program scores 20.
An agent spread uniformly across 10 programs scores 2.

### 6.3 Total Score
```
trustScore = operatorReputation + transactionConsistency
           + authorizationDepth + programSpecialization
```

---

## 7. Credential Interface

Credentials are live via the Solana Attestation Service.
`getIdentity()` and `getAgentIdentity()` both return populated credentials
for any wallet that holds SAS attestations.

```typescript
interface SIKCredential {
  id:        string;           // attestation PDA (base58)
  issuer:    { address: string; credentialPda: string; name: string | null };
  schema:    { pda: string; name: string };
  issuedAt:  number;           // unix timestamp
  expiresAt: number | null;    // null = no expiry
  expired:   boolean;
  data:      Record<string, unknown>; // deserialized schema fields
}
```

**Implementation:**
- No custom on-chain program — bridges to the Solana Attestation Service
- `@sik-sdk/credentials` queries SAS via `getProgramAccounts` (memcmp on nonce)
- Decodes raw account bytes with `sas-lib` Borsh decoders
- Fully backwards-compatible: wallets with no SAS attestations return `[]`

---

## 8. Caching

The reference implementation caches identity objects in-memory with a
configurable TTL (default: 1 hour). Callers can override:

```typescript
// Default: 1 hour TTL
const identity = await getIdentity("example.sol", connection)

// Force a live read — bypass cache
const identity = await getIdentity("example.sol", connection, { cache: false })

// Custom TTL — re-fetch every 5 minutes
const identity = await getIdentity("example.sol", connection, { cacheTTL: 300_000 })
```

Cache invalidation is caller-controlled. The same options apply to
`getAgentIdentity()`.

---

## 9. Versioning

| Version | Component | Status |
|---|---|---|
| SIK-1 | Core SDK + Reputation + Auth + Agent + Credentials | ✅ Live |
| SIK-2 | Native on-chain issuer registry (Anchor program) | 🔲 Grant-funded |
| SIK-3 | ZK selective disclosure | 🔲 Planned |
| SIK-4 | Ecosystem integrations (5+ apps) | 🔲 Planned |

Backwards compatibility: `SIKIdentity.credentials` is always a valid array.
`AgentIdentity.capabilities` is always a valid array.
Apps depending on empty arrays today receive populated data as credentials
are issued — no interface change required.

---

## 10. References

- [SNS Records V2](https://docs.sns.id/records)
- [Bonfida SPL Name Service](https://github.com/Bonfida/spl-name-service)
- [Solana Attestation Service](https://github.com/solana-attestation-service)
- [SPL Governance](https://github.com/solana-labs/solana-program-library/tree/master/governance)
- [Solana RPC API](https://docs.solana.com/api)
