export interface SIKCredential {
  id: string;

  issuer: {
    address: string;
    credentialPda: string;
    name: string | null;
  };

  schema: {
    pda: string;
    name: string;
  };

  issuedAt: number;
  expiresAt: number | null;
  expired: boolean;

  data: Record<string, unknown>;
}
