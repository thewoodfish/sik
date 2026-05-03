import dynamic from "next/dynamic";
import Link from "next/link";
import { LandingSearch } from "@/components/LandingSearch";

// Loaded client-side only — needs wallet context
const ConnectWalletSection = dynamic(
  () => import("@/components/ConnectWalletSection").then((m) => m.ConnectWalletSection),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-brand-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-brand-purple font-bold text-xl">SIK</span>
          <span className="text-gray-500 text-sm">Solana Identity Kit</span>
        </div>
        <ConnectWalletSection />
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-brand-card border border-brand-border rounded-full px-4 py-1.5 text-sm text-brand-green">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            Built on SNS · Colosseum Frontier Hackathon
          </div>

          <h1 className="text-5xl font-bold leading-tight">
            One call to resolve any{" "}
            <span className="text-brand-purple">.sol</span> identity
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            SIK is the identity primitive every Solana app has been rebuilding
            independently — now standardised. Profile, reputation score, and
            credentials from a single function call.
          </p>

          <div className="bg-brand-card border border-brand-border rounded-lg p-4 text-left font-mono text-sm">
            <span className="text-gray-500">{"// any Solana app"}</span>
            <br />
            <span className="text-brand-green">import</span>
            <span className="text-white"> {"{ getIdentity }"} </span>
            <span className="text-brand-green">from</span>
            <span className="text-brand-purple"> &quot;@sik/core&quot;</span>
            <span className="text-white">;</span>
            <br />
            <br />
            <span className="text-gray-400">const identity = </span>
            <span className="text-brand-green">await</span>
            <span className="text-gray-400"> getIdentity(</span>
            <span className="text-brand-purple">&quot;bonfida.sol&quot;</span>
            <span className="text-gray-400">, connection);</span>
          </div>

          <LandingSearch />
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t border-brand-border px-6 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Profile"
            description="Avatar, social links, and metadata from SNS Records V2. Fetched in parallel, gracefully degraded."
            color="text-brand-purple"
          />
          <FeatureCard
            title="Reputation"
            description="0–100 score computed from public on-chain signals. No oracles. Reproducible by anyone with an RPC."
            color="text-brand-green"
          />
          <FeatureCard
            title="Credentials"
            description="Attestations layer — stubbed in SIK-1. On-chain program deployment planned for SIK-2."
            color="text-yellow-400"
            badge="SIK-2"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-border px-6 py-6 flex items-center justify-between text-sm text-gray-500">
        <span>SIK · Solana Identity Kit · SIK-1</span>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/thewoodfish/sik"
            className="hover:text-white transition-colors"
            target="_blank"
          >
            GitHub
          </Link>
          <Link href="/docs/SIK-1" className="hover:text-white transition-colors">
            Protocol Spec
          </Link>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  color,
  badge,
}: {
  title: string;
  description: string;
  color: string;
  badge?: string;
}) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-lg p-6 space-y-3">
      <div className="flex items-center gap-2">
        <h3 className={`font-bold text-lg ${color}`}>{title}</h3>
        {badge && (
          <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded px-2 py-0.5">
            {badge}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
