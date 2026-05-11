import dynamic from "next/dynamic";
import Link from "next/link";
import { LandingSearch } from "@/components/LandingSearch";

const ConnectWalletSection = dynamic(
  () => import("@/components/ConnectWalletSection").then((m) => m.ConnectWalletSection),
  { ssr: false }
);

const SignInButton = dynamic(
  () => import("@/components/SignInButton").then((m) => m.SignInButton),
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
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-brand-card border border-brand-border rounded-full px-4 py-1.5 text-sm text-brand-green">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            Built on SNS · Colosseum Frontier Hackathon
          </div>

          <h1 className="text-5xl font-bold leading-tight">
            ENS gives you a name.<br />
            <span className="text-brand-purple">SIK gives you an identity.</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Profile. Reputation. Credentials. For humans and agents.
            One SDK call. Open source. Solana-native.
          </p>

          <div className="flex flex-col items-center gap-3">
            <LandingSearch />
            <SignInButton />
          </div>
        </div>
      </section>

      {/* Two audience cards */}
      <section className="border-t border-brand-border px-6 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Human Identity */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-8 space-y-4">
            <div className="text-3xl">👤</div>
            <h2 className="text-xl font-bold text-white">Human Identity</h2>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2"><span className="text-brand-green">✓</span> Sign in with .sol — standardised auth session</li>
              <li className="flex items-center gap-2"><span className="text-brand-green">✓</span> Portable reputation score (0–100, on-chain)</li>
              <li className="flex items-center gap-2"><span className="text-brand-green">✓</span> Verifiable credentials via SAS</li>
            </ul>
            <Link
              href="/bonfida.sol"
              className="inline-block mt-2 text-sm text-brand-purple hover:underline"
            >
              Try bonfida.sol →
            </Link>
          </div>

          {/* Agent Identity */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-8 space-y-4">
            <div className="text-3xl">🤖</div>
            <h2 className="text-xl font-bold text-white">Agent Identity</h2>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2"><span className="text-cyan-400">✓</span> Give your agent a .sol name + capabilities</li>
              <li className="flex items-center gap-2"><span className="text-cyan-400">✓</span> On-chain trust score — operator, consistency, credentials</li>
              <li className="flex items-center gap-2"><span className="text-cyan-400">✓</span> Any protocol verifies the agent before granting access</li>
            </ul>
            <Link
              href="/demo/dao-gate"
              className="inline-block mt-2 text-sm text-cyan-400 hover:underline"
            >
              Try agent gate demo →
            </Link>
          </div>
        </div>
      </section>

      {/* Developer code block */}
      <section className="border-t border-brand-border px-6 py-16 bg-brand-card/30">
        <div className="max-w-2xl mx-auto space-y-4 text-center">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Any app. One call.</p>
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 text-left font-mono text-sm">
            <div className="space-y-1">
              <div>
                <span className="text-brand-green">import</span>
                <span className="text-white"> {"{ getIdentity }"} </span>
                <span className="text-brand-green">from</span>
                <span className="text-brand-purple"> &quot;@sik-sdk/core&quot;</span>
              </div>
              <div className="pt-2">
                <span className="text-gray-400">const identity = </span>
                <span className="text-brand-green">await</span>
                <span className="text-gray-400"> getIdentity(</span>
                <span className="text-brand-purple">&quot;example.sol&quot;</span>
                <span className="text-gray-400">, connection)</span>
              </div>
              <div className="text-gray-600 text-xs pt-1">
                {"// identity.profile · identity.reputation · identity.credentials"}
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-xs font-mono">npm install @sik-sdk/core</p>
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
