"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import type { SIKIdentity } from "@sik/core";

const THRESHOLD = 30;

type CheckState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; identity: SIKIdentity };

export default function DaoGatePage() {
  const [input, setInput] = useState("bonfida.sol");
  const [state, setState] = useState<CheckState>({ status: "idle" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const domain = input.trim();
    if (!domain) return;

    setState({ status: "loading" });
    try {
      const res = await fetch(`/api/identity?domain=${encodeURIComponent(domain)}`);
      const data: unknown = await res.json();
      if (!res.ok) {
        const err = data as { error?: string };
        setState({ status: "error", message: err.error ?? "Unknown error" });
        return;
      }
      setState({ status: "done", identity: data as SIKIdentity });
    } catch (e) {
      setState({ status: "error", message: String(e) });
    }
  }

  const resolvedDomain = state.status === "done" ? state.identity.domain : null;

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

          <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-gray-400 text-sm">
                Enter a .sol name to check access:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="bonfida.sol"
                  className="flex-1 bg-brand-dark border border-brand-border rounded-lg px-4 py-2 text-gray-100 font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-brand-purple transition-colors"
                />
                <button
                  type="submit"
                  disabled={state.status === "loading"}
                  className="px-5 py-2 bg-brand-purple text-white rounded-lg font-semibold text-sm hover:bg-brand-purple/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.status === "loading" ? "Checking…" : "Check"}
                </button>
              </div>
            </form>

            {state.status === "loading" && (
              <div className="space-y-3 animate-pulse">
                <div className="h-5 bg-brand-border rounded w-3/4" />
                <div className="h-5 bg-brand-border rounded w-2/3" />
                <div className="h-5 bg-brand-border rounded w-1/2" />
              </div>
            )}

            {state.status === "error" && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-900/40 rounded-lg px-4 py-3">
                {state.message}
              </div>
            )}

            {state.status === "done" && (() => {
              const { identity } = state;
              const score = identity.reputation.score;
              const meetsThreshold = score >= THRESHOLD;

              return (
                <div className="space-y-3 border-t border-brand-border pt-4">
                  <ResultRow pass={true} label={`Reputation score: ${score}/100`} />
                  <ResultRow
                    pass={meetsThreshold}
                    label={`Meets minimum threshold (${THRESHOLD})`}
                  />
                  <ResultRow
                    pass={meetsThreshold}
                    label={meetsThreshold ? "Access granted" : "Access denied"}
                  />

                  <div className="pt-2">
                    <Link
                      href={`/${identity.domain}`}
                      className="text-xs text-brand-purple hover:underline"
                    >
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
{`const identity = await getIdentity("${resolvedDomain ?? "bonfida.sol"}", connection);
const score = identity.reputation.score;
const access = score >= ${THRESHOLD}; // threshold set by your DAO`}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}

function ResultRow({ pass, label }: { pass: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={pass ? "text-brand-green" : "text-red-400"}>
        {pass ? "✅" : "❌"}
      </span>
      <span className={pass ? "text-gray-200" : "text-gray-400"}>{label}</span>
    </div>
  );
}
