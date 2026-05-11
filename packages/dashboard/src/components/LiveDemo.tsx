"use client";

import { useState, useEffect, useRef } from "react";
import type { SIKIdentity } from "@sik-sdk/core";

const DEFAULT_DOMAIN = "bonfida.sol";

export function LiveDemo() {
  const [input, setInput] = useState(DEFAULT_DOMAIN);
  const [domain, setDomain] = useState(DEFAULT_DOMAIN);
  const [identity, setIdentity] = useState<SIKIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animated, setAnimated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setAnimated(false);
    fetch(`/api/identity?domain=${encodeURIComponent(domain)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setIdentity(data as SIKIdentity);
        setLoading(false);
        setTimeout(() => setAnimated(true), 80);
      })
      .catch(() => { setError("Failed to resolve"); setLoading(false); });
  }, [domain]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const d = input.trim();
    if (d) setDomain(d.endsWith(".sol") ? d : d + ".sol");
  }

  const score = identity?.reputation.score ?? 0;
  const breakdown = identity?.reputation.breakdown;
  const creds = identity?.credentials ?? [];

  const scoreColor = score >= 70 ? "#14F195" : score >= 40 ? "#facc15" : "#f87171";

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Search */}
      <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="any .sol name"
          className="flex-1 bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-gray-100 font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-brand-purple transition-colors"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-brand-purple text-white rounded-xl font-semibold text-sm hover:bg-purple-600 transition-colors"
        >
          Resolve
        </button>
      </form>

      {/* Split screen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Code panel */}
        <div className="bg-[#0d0d1a] border border-brand-border rounded-2xl p-6 font-mono text-sm leading-relaxed">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="text-gray-600 text-xs ml-2">identity.ts</span>
          </div>
          <div className="space-y-1 text-[13px]">
            <div>
              <span className="text-brand-green">import</span>
              <span className="text-gray-300"> {"{ getIdentity }"} </span>
              <span className="text-brand-green">from</span>
              <span className="text-brand-purple"> &quot;@sik-sdk/core&quot;</span>
            </div>
            <div className="pt-2">
              <span className="text-gray-500">const identity = </span>
              <span className="text-brand-green">await </span>
              <span className="text-gray-300">getIdentity(</span>
            </div>
            <div className="pl-4">
              <span className="text-brand-purple">&quot;{domain}&quot;</span>
              <span className="text-gray-500">,</span>
            </div>
            <div className="pl-4 text-gray-500">connection</div>
            <div className="text-gray-300">)</div>

            <div className="pt-4 space-y-1.5 border-t border-brand-border/50">
              {loading ? (
                <div className="space-y-2 animate-pulse pt-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-4 bg-brand-border rounded" style={{ width: `${60 + i * 8}%` }} />
                  ))}
                </div>
              ) : error ? (
                <div className="text-red-400 text-xs pt-1">// Error: {error}</div>
              ) : identity ? (
                <>
                  <div>
                    <span className="text-gray-600">{"// "}</span>
                    <span className="text-gray-500">owner  </span>
                    <span className="text-gray-400">&quot;{identity.owner.slice(0,4)}…{identity.owner.slice(-4)}&quot;</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{"// "}</span>
                    <span className="text-gray-500">score  </span>
                    <span style={{ color: scoreColor }} className="font-bold">{score}</span>
                    <span className="text-gray-600"> / 100</span>
                  </div>
                  {identity.profile.twitter && (
                    <div>
                      <span className="text-gray-600">{"// "}</span>
                      <span className="text-gray-500">twitter  </span>
                      <span className="text-brand-purple">&quot;{identity.profile.twitter}&quot;</span>
                    </div>
                  )}
                  {identity.profile.github && (
                    <div>
                      <span className="text-gray-600">{"// "}</span>
                      <span className="text-gray-500">github   </span>
                      <span className="text-brand-purple">&quot;{identity.profile.github}&quot;</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">{"// "}</span>
                    <span className="text-gray-500">credentials  </span>
                    <span className="text-brand-green">{creds.length}</span>
                    <span className="text-gray-600"> attestation{creds.length !== 1 ? "s" : ""}</span>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Identity panel */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-6 space-y-5">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-brand-border" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-brand-border rounded w-1/2" />
                  <div className="h-4 bg-brand-border rounded w-1/3" />
                </div>
              </div>
              <div className="h-3 bg-brand-border rounded" />
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-3 bg-brand-border rounded" style={{ width: `${50 + i * 7}%` }} />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
              Could not resolve &quot;{domain}&quot;
            </div>
          ) : identity ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
                  style={{ background: `linear-gradient(135deg, #9945FF, #14F195)` }}
                >
                  {domain[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{domain}</h3>
                  <p className="text-gray-500 text-xs font-mono">
                    {identity.owner.slice(0, 6)}…{identity.owner.slice(-6)}
                  </p>
                </div>
              </div>

              {/* Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Reputation Score</span>
                  <span className="text-2xl font-bold" style={{ color: scoreColor }}>
                    {score}<span className="text-gray-600 text-base">/100</span>
                  </span>
                </div>
                <div className="h-2 bg-brand-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: animated ? `${score}%` : "0%",
                      background: `linear-gradient(90deg, #9945FF, #14F195)`,
                    }}
                  />
                </div>
              </div>

              {/* Breakdown */}
              {breakdown && (
                <div className="space-y-1.5">
                  {(Object.entries(breakdown) as [string, number][]).map(([key, val]) => {
                    const maxMap: Record<string, number> = {
                      accountAge: 20, transactionVolume: 20, programDiversity: 20,
                      daoParticipation: 20, solBalance: 10, nftHoldings: 10,
                    };
                    const max = maxMap[key] ?? 20;
                    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
                    return (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500 w-36 shrink-0">{label}</span>
                        <div className="flex-1 h-1.5 bg-brand-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-brand-purple transition-all duration-700 ease-out"
                            style={{ width: animated ? `${(val / max) * 100}%` : "0%" }}
                          />
                        </div>
                        <span className="text-gray-400 w-8 text-right">{val}/{max}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Social + credentials */}
              <div className="flex items-center gap-3 flex-wrap pt-1">
                {identity.profile.twitter && (
                  <a href={`https://twitter.com/${identity.profile.twitter}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-white transition-colors">
                    @{identity.profile.twitter}
                  </a>
                )}
                {identity.profile.github && (
                  <a href={`https://github.com/${identity.profile.github}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-white transition-colors">
                    github/{identity.profile.github}
                  </a>
                )}
                {creds.length > 0 && (
                  <span className="text-xs bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-full px-2 py-0.5">
                    {creds.length} credential{creds.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
