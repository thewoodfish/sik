export interface ReputationBreakdown {
  /** 0–20: age of oldest on-chain transaction */
  accountAge: number;
  /** 0–20: log-scaled transaction count */
  transactionVolume: number;
  /** 0–20: unique non-system programs interacted with */
  programDiversity: number;
  /** 0–20: governance program interactions */
  daoParticipation: number;
  /** 0–10: SOL balance */
  solBalance: number;
  /** 0–10: NFT holdings (supply=1, decimals=0) */
  nftHoldings: number;
}
