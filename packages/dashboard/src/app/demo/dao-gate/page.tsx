"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import type { SIKIdentity } from "@sik-sdk/core";
import type { AgentIdentity } from "@sik-sdk/agent";

const HUMAN_THRESHOLD = 30;
const AGENT_THRESHOLD = 70;

type Tab = "human" | "agent";

type CheckState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; data: T };

export default function DaoGatePage() {
  const [tab, setTab] = useState<Tab>("human");

  const [humanInput, setHumanInput] = useState("bonfida.sol");
  const [humanState, setHumanState] = useState<CheckState<SIKIdentity>>({ status: "idle" });

  const [agentInput, setAgentInput] = useState("");
  const [agentState, setAgentState] = useState<CheckState<AgentIdentity>>({ status: "idle" });

  async function handleHumanSubmit(e: FormEvent) {
    e.preventDefault();
    const domain = humanInput.trim();
    if (!domain) return;
    setHumanState({ status: "loading" });
    try {
      const res = await fetch(`/api/identity?domain=${encodeURIComponent(domain)}`);
      const data: unknown = await res.json();
      if (!res.ok) {
        setHumanState({ status: "error", message: (data as { error?: string }).error ?? "Unknown error" });
        return;
      }
      setHumanState({ status: "done", data: data as SIKIdentity });
    } catch (e) {
      setHumanState({ status: "error", message: String(e) });
    }
  }

  async function handleAgentSubmit(e: FormEvent) {
    e.preventDefault();
    const domain = agentInput.trim();
    if (!domain) return;
    setAgentState({ status: "loading" });
    try {
      const res = await fetch(`/api/agent?domain=${encodeURIComponent(domain)}`);
      const data: unknown = await res.json();
      if (!res.ok) {
        setAgentState({ status: "error", message: (data as { error?: string }).error ?? "Unknown error" });
        return;
      }
      setAgentState({ status: "done", data: data as AgentIdentity });
    } catch (e) {
      setAgentState({ status: "error", message: String(e) });
    }
  }

  const resolvedHumanDomain = humanState.status === "done" ? humanState.data.domain : null;
  const resolvedAgentDomain = agentState.status === "done" ? agentState.data.domain : null;

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-brand-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-brand-purple font-bold text-xl">SIK</span>
          <span className="text-gray-500 text-sm">Solana Identity Kit</span>
        </Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-brand-purple transition-colors">
          ← Back
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-brand-purple">DAO Access Gate</h1>
            <p className="text-gray-500 text-sm">Powered by SIK</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg border border-brand-border overflow-hidden">
            <button
              onClick={() => setTab("human")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === "human"
                  ? "bg-brand-purple text-white"
                  : "bg-brand-card text-gray-400 hover:text-white"
              }`}
            >
              👤 Human Identity
            </button>
            <button
              onClick={() => setTab("agent")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === "agent"
                  ? "bg-cyan-600 text-white"
                  : "bg-brand-card text-gray-400 hover:text-white"
              }`}
            >
              🤖 Agent Identity
            </button>
          </div>

          {/* Human tab */}
          {tab === "human" && (
            <>
              <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-6">
                <form onSubmit={handleHumanSubmit} className="space-y-4">
                  <label className="block text-gray-400 text-sm">
                    Enter a .sol name to check access:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={humanInput}
                      onChange={(e) => setHumanInput(e.target.value)}
                      placeholder="bonfida.sol"
                      className="flex-1 bg-brand-dark border border-brand-border rounded-lg px-4 py-2 text-gray-100 font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-brand-purple transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={humanState.status === "loading"}
                      className="px-5 py-2 bg-brand-purple text-white rounded-lg font-semibold text-sm hover:bg-brand-purple/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {humanState.status === "loading" ? "Checking…" : "Check"}
                    </button>
                  </div>
                </form>

                {humanState.status === "loading" && <LoadingSkeleton />}
                {humanState.status === "error" && <ErrorBox message={humanState.message} />}
                {humanState.status === "done" && (() => {
                  const { data: identity } = humanState;
                  const score = identity.reputation.score;
                  const passes = score >= HUMAN_THRESHOLD;
                  return (
                    <div className="space-y-3 border-t border-brand-border pt-4">
                      <ResultRow pass={true} label={`Reputation score: ${score}/100`} />
                      <ResultRow pass={passes} label={`Meets minimum threshold (${HUMAN_THRESHOLD})`} />
                      <ResultRow pass={passes} label={passes ? "Access granted" : "Access denied"} />
                      <div className="pt-2">
                        <Link href={`/${identity.domain}`} className="text-xs text-brand-purple hover:underline">
                          View full profile for {identity.domain} →
                        </Link>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-3">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Built with — 3 lines of code
                </p>
                <pre className="text-xs font-mono text-brand-green leading-relaxed overflow-x-auto">
{`const identity = await getIdentity("${resolvedHumanDomain ?? "bonfida.sol"}", connection);
const score = identity.reputation.score;
const access = score >= ${HUMAN_THRESHOLD}; // threshold set by your DAO`}
                </pre>
              </div>
            </>
          )}

          {/* Agent tab */}
          {tab === "agent" && (
            <>
              <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-6">
                <form onSubmit={handleAgentSubmit} className="space-y-4">
                  <label className="block text-gray-400 text-sm">
                    Enter an agent .sol name to verify:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={agentInput}
                      onChange={(e) => setAgentInput(e.target.value)}
                      placeholder="myagent.sol"
                      className="flex-1 bg-brand-dark border border-brand-border rounded-lg px-4 py-2 text-gray-100 font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={agentState.status === "loading"}
                      className="px-5 py-2 bg-cyan-600 text-white rounded-lg font-semibold text-sm hover:bg-cyan-600/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {agentState.status === "loading" ? "Checking…" : "Check"}
                    </button>
                  </div>
                </form>

                {agentState.status === "loading" && <LoadingSkeleton />}
                {agentState.status === "error" && <ErrorBox message={agentState.message} />}
                {agentState.status === "done" && (() => {
                  const { data: agent } = agentState;
                  const passes = agent.trustScore >= AGENT_THRESHOLD;
                  const hasCaps = agent.capabilities.length > 0;
                  return (
                    <div className="space-y-3 border-t border-brand-border pt-4">
                      <ResultRow pass={true} label={`Trust score: ${agent.trustScore}/100`} />
                      <ResultRow pass={passes} label={`Meets trust threshold (${AGENT_THRESHOLD})`} />
                      <ResultRow pass={hasCaps} label={hasCaps ? `Capabilities: ${agent.capabilities.join(", ")}` : "No registered capabilities"} />
                      <ResultRow pass={passes} label={passes ? "Agent access granted" : "Agent access denied"} />
                      <div className="pt-2">
                        <Link href={`/agent/${agent.domain}`} className="text-xs text-cyan-400 hover:underline">
                          View agent identity for {agent.domain} →
                        </Link>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-3">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Built with — 4 lines of code
                </p>
                <pre className="text-xs font-mono text-cyan-400 leading-relaxed overflow-x-auto">
{`const agent = await getAgentIdentity("${resolvedAgentDomain ?? "myagent.sol"}", connection);
const trusted = agent.trustScore >= ${AGENT_THRESHOLD};
const canPay = agent.capabilities.includes("payments");
const access = trusted && canPay;`}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function ResultRow({ pass, label }: { pass: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={pass ? "text-brand-green" : "text-red-400"}>{pass ? "✅" : "❌"}</span>
      <span className={pass ? "text-gray-200" : "text-gray-400"}>{label}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-5 bg-brand-border rounded w-3/4" />
      <div className="h-5 bg-brand-border rounded w-2/3" />
      <div className="h-5 bg-brand-border rounded w-1/2" />
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="text-red-400 text-sm bg-red-900/20 border border-red-900/40 rounded-lg px-4 py-3">
      {message}
    </div>
  );
}
