import type { Credential } from "@sik/core";

interface Props {
  credentials: Credential[];
}

export function CredentialList({ credentials }: Props) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Credentials</h2>
        <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded px-2 py-0.5">
          SIK-2
        </span>
      </div>

      {credentials.length === 0 ? (
        <div className="text-center py-8 space-y-3">
          <div className="text-4xl">🔐</div>
          <p className="text-gray-400 text-sm">No credentials yet.</p>
          <p className="text-gray-600 text-xs max-w-sm mx-auto">
            Verifiable on-chain attestations are coming in SIK-2. Issuers will
            be able to sign and publish credentials directly to a wallet&apos;s
            identity — accessible via <code className="text-gray-400">identity.credentials</code>.
          </p>
          <a
            href="https://github.com/thewoodfish/sik/blob/main/docs/SIK-1.md#credentials"
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs text-brand-purple hover:underline"
          >
            Read the SIK-2 credential spec →
          </a>
        </div>
      ) : (
        <ul className="space-y-3">
          {credentials.map((c) => (
            <li key={c.id} className="bg-brand-border/40 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{c.type}</span>
                <span className="text-gray-500 text-xs">
                  {new Date(c.issuedAt * 1000).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-1 font-mono truncate">{c.issuer}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
