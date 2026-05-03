// Minimal shim for the return type of getParsedTokenAccountsByOwner
export interface TokenAmountInfo {
  uiAmount: number | null;
  decimals: number;
  amount: string;
}

export interface ParsedTokenAccountInfo {
  tokenAmount?: TokenAmountInfo;
}

export interface ParsedTokenAccountData {
  parsed?: {
    info?: ParsedTokenAccountInfo;
  };
}

export interface ParsedTokenAccount {
  account: {
    data: ParsedTokenAccountData;
  };
}

export interface ParsedTokenAccountsByOwner {
  value: ParsedTokenAccount[];
}
