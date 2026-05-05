import type { AgentIdentity } from "@sik-sdk/agent";

interface Props {
  identity: AgentIdentity;
}

const CAPABILITY_LABELS: Record<string, string> = {
  payments: "Payments",
  web_search: "Web Search",
  code_execution: "Code",
  data_access: "Data Access",
  trading: "Trading",
  governance: "Governance",
  cross_chain: "Cross-chain",
};

export function AgentCard({ identity }: Props) {
  const lastActiveFmt = identity.lastActive
    ? new Date(identity.lastActive * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-brand-purple flex items-center justify-center text-2xl font-bold text-white shrink-0">
          {identity.domain[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-white">{identity.domain}</h1>
            <span className="text-xs bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 rounded-full px-2 py-0.5">
              Agent Identity
            </span>
          </div>
          <p className="text-gray-500 text-sm font-mono mt-0.5 truncate">
            {identity.address.slice(0, 6)}…{identity.address.slice(-6)}
          </p>
        </div>
      </div>

      {/* Trust Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Trust Score</span>
          <span className="text-2xl font-bold text-white">{identity.trustScore}<span className="text-gray-500 text-base">/100</span></span>
        </div>
        <div className="h-2 bg-brand-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-brand-purple rounded-full transition-all"
            style={{ width: `${identity.trustScore}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
          <span>Operator Rep · {identity.trustBreakdown.operatorReputation}</span>
          <span>Consistency · {identity.trustBreakdown.transactionConsistency}</span>
          <span>Auth Depth · {identity.trustBreakdown.authorizationDepth}</span>
          <span>Specialization · {identity.trustBreakdown.programSpecialization}</span>
        </div>
      </div>

      {/* Capabilities */}
      {identity.capabilities.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm text-gray-400">Capabilities</span>
          <div className="flex flex-wrap gap-2">
            {identity.capabilities.map((cap) => (
              <span
                key={cap}
                className="text-xs bg-brand-purple/10 text-brand-purple border border-brand-purple/20 rounded-full px-3 py-1"
              >
                {CAPABILITY_LABELS[cap] ?? cap}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Operator */}
      {identity.operator && (
        <div className="space-y-1">
          <span className="text-sm text-gray-400">Operated by</span>
          <p className="text-sm font-mono text-gray-300">
            {identity.operatorDomain
              ? <>{identity.operatorDomain} <span className="text-gray-500">({identity.operator.slice(0, 4)}…{identity.operator.slice(-4)})</span></>
              : `${identity.operator.slice(0, 6)}…${identity.operator.slice(-6)}`}
          </p>
        </div>
      )}

      {/* Profile links */}
      {(identity.profile.url || identity.profile.github) && (
        <div className="flex gap-3 text-sm">
          {identity.profile.url && (
            <a
              href={identity.profile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-purple hover:underline truncate"
            >
              {identity.profile.url}
            </a>
          )}
          {identity.profile.github && (
            <a
              href={`https://github.com/${identity.profile.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              GitHub →
            </a>
          )}
        </div>
      )}

      {/* Last active */}
      {lastActiveFmt && (
        <p className="text-xs text-gray-600">Last active {lastActiveFmt}</p>
      )}
    </div>
  );
}
