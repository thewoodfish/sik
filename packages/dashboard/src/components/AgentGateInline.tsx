"use client";

import { useState } from "react";
import type { AgentIdentity } from "@sik-sdk/agent";

const THRESHOLD = 30;

export function AgentGateInline() {
  const [input, setInput] = useState("bonfida.sol");
  const [agent, setAgent] = useState<AgentIdentity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const d = input.trim();
    if (!d) return;
    const domain = d.endsWith(".sol") ? d : d + ".sol";
    setLoading(true);
    setError(null);
    setAgent(null);
    fetch(`/api/agent?domain=${encodeURIComponent(domain)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setAgent(data as AgentIdentity);
        setLoading(false);
      })
      .catch(() => { setError("Failed to resolve"); setLoading(false); });
  }

  const passes = (agent?.trustScore ?? 0) >= THRESHOLD;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-4xl mx-auto">
      {/* Input + result */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-6 space-y-5">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">Agent Gate Demo</p>
          <p className="text-gray-600 text-xs">Does this agent meet the trust threshold?</p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="agent.sol"
            className="flex-1 bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-gray-100 font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-semibold hover:bg-cyan-500 transition-colors disabled:opacity-50"
          >
            {loading ? "…" : "Check"}
          </button>
        </form>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        {agent && (
          <div className="space-y-2 border-t border-brand-border pt-4">
            <Row pass label={`Trust score: ${agent.trustScore}/100`} />
            <Row pass={passes} label={`Meets threshold (${THRESHOLD})`} />
            {agent.capabilities.length > 0 && (
              <Row pass label={`Capabilities: ${agent.capabilities.join(", ")}`} />
            )}
            <Row pass={passes} label={passes ? "✓ Access granted" : "✗ Access denied"} />
          </div>
        )}
      </div>

      {/* Code */}
      <div className="bg-[#0d0d1a] border border-brand-border rounded-2xl p-6 font-mono text-[13px] leading-relaxed">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3 h-3 rounded-full bg-red-500/60" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <span className="w-3 h-3 rounded-full bg-green-500/60" />
          <span className="text-gray-600 text-xs ml-2">agent-gate.ts</span>
        </div>
        <div className="space-y-1">
          <div>
            <span className="text-brand-green">import</span>
            <span className="text-gray-300"> {"{ getAgentIdentity }"} </span>
            <span className="text-brand-green">from</span>
            <span className="text-brand-purple"> &quot;@sik-sdk/agent&quot;</span>
          </div>
          <div className="pt-2">
            <span className="text-gray-500">const agent = </span>
            <span className="text-brand-green">await </span>
            <span className="text-gray-300">getAgentIdentity(</span>
          </div>
          <div className="pl-4">
            <span className="text-brand-purple">&quot;{agent?.domain ?? (input || "myagent.sol")}&quot;</span>
            <span className="text-gray-500">, connection</span>
          </div>
          <div className="text-gray-300">)</div>
          <div className="pt-3 border-t border-brand-border/50 space-y-1">
            <div>
              <span className="text-gray-500">const trusted = agent.trustScore </span>
              <span className="text-gray-300">&gt;= </span>
              <span className="text-brand-green">{THRESHOLD}</span>
              {agent && (
                <span className={passes ? "text-brand-green" : "text-red-400"}> // {passes ? "true ✓" : "false ✗"}</span>
              )}
            </div>
            {agent && agent.capabilities.length > 0 && (
              <div>
                <span className="text-gray-500">const canPay = agent.capabilities</span>
                <span className="text-gray-300">.includes(</span>
                <span className="text-brand-purple">&quot;payments&quot;</span>
                <span className="text-gray-300">)</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">const access = trusted</span>
              {agent && (
                <span className={passes ? "text-brand-green" : "text-red-400"}> // {passes ? "granted" : "denied"}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ pass, label }: { pass: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={pass ? "text-brand-green" : "text-red-400"}>{pass ? "✅" : "❌"}</span>
      <span className={pass ? "text-gray-200" : "text-gray-400"}>{label}</span>
    </div>
  );
}
