"use client";

import { useState, useEffect } from "react";
import type { AgentIdentity } from "@sik-sdk/agent";

interface Props {
  identity: AgentIdentity;
}

const CAPABILITY_LABELS: Record<string, string> = {
  payments: "Payments",
  web_search: "Web Search",
  code_execution: "Code Execution",
  data_access: "Data Access",
  trading: "Trading",
  governance: "Governance",
  cross_chain: "Cross-chain",
};

const SIGNALS: {
  key: keyof import("@sik-sdk/agent").AgentTrustBreakdown;
  label: string;
  max: number;
  description: string;
}[] = [
  {
    key: "operatorReputation",
    label: "Operator Reputation",
    max: 30,
    description: "Inherited from the operator's on-chain SIK score — the human behind this agent.",
  },
  {
    key: "transactionConsistency",
    label: "Transaction Consistency",
    max: 25,
    description: "Regularity of on-chain activity. Low variance in transaction timing = higher trust.",
  },
  {
    key: "authorizationDepth",
    label: "Authorization Depth",
    max: 25,
    description: "SAS credentials issued to this agent by trusted protocols.",
  },
  {
    key: "programSpecialization",
    label: "Program Specialization",
    max: 20,
    description: "Sustained, high-volume activity. Active agents earn trust through consistent usage.",
  },
];

function signalColor(val: number, max: number): string {
  const pct = val / max;
  if (pct >= 0.7) return "#14F195";
  if (pct >= 0.4) return "#facc15";
  return "#f87171";
}

function trustColor(score: number): string {
  if (score >= 70) return "#14F195";
  if (score >= 40) return "#facc15";
  return "#f87171";
}

export function AgentCard({ identity }: Props) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 80); }, []);

  const lastActiveFmt = identity.lastActive
    ? new Date(identity.lastActive * 1000).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : null;

  const registeredFmt = identity.registeredAt
    ? new Date(identity.registeredAt * 1000).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : null;

  const tc = trustColor(identity.trustScore);

  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="p-6 border-b border-brand-border space-y-4">
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
            <p className="text-gray-500 text-xs font-mono mt-0.5">
              {identity.address.slice(0, 8)}…{identity.address.slice(-8)}
            </p>
          </div>
          {/* Big trust score */}
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500 mb-0.5">Trust Score</p>
            <p className="text-4xl font-bold" style={{ color: tc }}>
              {identity.trustScore}
              <span className="text-gray-600 text-lg">/100</span>
            </p>
          </div>
        </div>

        {/* Overall bar */}
        <div className="h-2.5 bg-brand-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: animated ? `${identity.trustScore}%` : "0%",
              background: `linear-gradient(90deg, #06b6d4, ${tc})`,
            }}
          />
        </div>
      </div>

      {/* Trust Breakdown */}
      <div className="p-6 border-b border-brand-border space-y-5">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Trust Breakdown</p>
        {SIGNALS.map(({ key, label, max, description }) => {
          const val = identity.trustBreakdown[key];
          const pct = max > 0 ? (val / max) * 100 : 0;
          const color = signalColor(val, max);
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">{label}</span>
                <span className="text-sm font-bold tabular-nums" style={{ color }}>
                  {val} <span className="text-gray-600 font-normal">/ {max}</span>
                </span>
              </div>
              <div className="h-2 bg-brand-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: animated ? `${pct}%` : "0%",
                    backgroundColor: color,
                  }}
                />
              </div>
              <p className="text-xs text-gray-600">{description}</p>
            </div>
          );
        })}
      </div>

      {/* Capabilities */}
      {identity.capabilities.length > 0 && (
        <div className="p-6 border-b border-brand-border space-y-3">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Capabilities</p>
          <div className="flex flex-wrap gap-2">
            {identity.capabilities.map((cap) => (
              <span
                key={cap}
                className="text-xs bg-brand-purple/10 text-brand-purple border border-brand-purple/20 rounded-full px-3 py-1 font-medium"
              >
                {CAPABILITY_LABELS[cap] ?? cap}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="p-6 grid grid-cols-2 gap-4 text-sm">
        {identity.operator && (
          <div className="space-y-0.5">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Operated by</p>
            <p className="font-mono text-gray-300 text-xs">
              {identity.operatorDomain
                ? <span className="text-brand-purple">{identity.operatorDomain}</span>
                : `${identity.operator.slice(0, 6)}…${identity.operator.slice(-6)}`}
            </p>
          </div>
        )}
        {lastActiveFmt && (
          <div className="space-y-0.5">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Last Active</p>
            <p className="text-gray-300 text-xs">{lastActiveFmt}</p>
          </div>
        )}
        {registeredFmt && (
          <div className="space-y-0.5">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Registered</p>
            <p className="text-gray-300 text-xs">{registeredFmt}</p>
          </div>
        )}
        {(identity.profile.url || identity.profile.github) && (
          <div className="space-y-0.5">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Links</p>
            <div className="flex gap-3">
              {identity.profile.github && (
                <a href={`https://github.com/${identity.profile.github}`} target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-xs transition-colors">
                  GitHub →
                </a>
              )}
              {identity.profile.url && (
                <a href={identity.profile.url} target="_blank" rel="noopener noreferrer"
                  className="text-brand-purple hover:underline text-xs truncate max-w-[120px]">
                  {identity.profile.url}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
