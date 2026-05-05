import type { SIKCredential } from "@sik-sdk/credentials";

interface Props {
  credentials: SIKCredential[];
}

export function CredentialList({ credentials }: Props) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Credentials</h2>
        <span className="text-xs bg-green-400/10 text-green-400 border border-green-400/20 rounded px-2 py-0.5">
          Live · SAS
        </span>
      </div>

      {credentials.length === 0 ? (
        <div className="text-center py-8 space-y-3">
          <div className="text-4xl">🔐</div>
          <p className="text-gray-400 text-sm">No credentials yet.</p>
          <p className="text-gray-600 text-xs max-w-sm mx-auto">
            Verifiable on-chain attestations appear here when issued by trusted
            parties via the{" "}
            <a
              href="https://attest.solana.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-purple hover:underline"
            >
              Solana Attestation Service
            </a>
            .
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {credentials.map((cred) => (
            <CredentialCard key={cred.id} credential={cred} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CredentialCard({ credential }: { credential: SIKCredential }) {
  return (
    <li className="bg-brand-border/40 rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-sm">{credential.schema.name}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {credential.expired && (
            <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded px-2 py-0.5">
              Expired
            </span>
          )}
          {credential.issuedAt > 0 && (
            <span className="text-gray-500 text-xs">
              {new Date(credential.issuedAt * 1000).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      <p className="text-gray-500 text-xs font-mono truncate">
        {credential.issuer.address !== "unknown"
          ? `${credential.issuer.address.slice(0, 4)}...${credential.issuer.address.slice(-4)}`
          : "unknown issuer"}
      </p>

      {Object.keys(credential.data).length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
          {Object.entries(credential.data).map(([key, val]) => (
            <div key={key} className="flex gap-2 text-xs">
              <span className="text-gray-500 shrink-0">{key}</span>
              <span className="text-gray-300 truncate">{String(val)}</span>
            </div>
          ))}
        </div>
      )}
    </li>
  );
}
