import dynamic from "next/dynamic";
import Link from "next/link";

const ConnectWalletSection = dynamic(
  () => import("@/components/ConnectWalletSection").then((m) => m.ConnectWalletSection),
  { ssr: false }
);
const SignInButton = dynamic(
  () => import("@/components/SignInButton").then((m) => m.SignInButton),
  { ssr: false }
);
const LiveDemo = dynamic(
  () => import("@/components/LiveDemo").then((m) => m.LiveDemo),
  { ssr: false }
);
const AgentGateInline = dynamic(
  () => import("@/components/AgentGateInline").then((m) => m.AgentGateInline),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-dark">

      {/* ── Header ── */}
      <header className="border-b border-brand-border px-6 py-4 flex items-center justify-between sticky top-0 bg-brand-dark/90 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <span className="text-brand-purple font-bold text-xl">SIK</span>
          <span className="text-gray-500 text-sm hidden sm:block">Solana Identity Kit</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/demo/dao-gate" className="text-sm text-gray-400 hover:text-brand-purple transition-colors hidden sm:block">
            Demo
          </Link>
          <Link href="https://github.com/thewoodfish/sik" target="_blank" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
            GitHub
          </Link>
          <ConnectWalletSection />
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="px-6 pt-20 pb-12 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-brand-card border border-brand-border rounded-full px-4 py-1.5 text-sm text-brand-green">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            Live on Solana mainnet · Colosseum Frontier 2026
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight">
            ENS gives you a name.<br />
            <span className="text-brand-purple">SIK gives you an identity.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Profile. Reputation. Credentials. For humans and agents.
            One SDK call. Open source. Solana-native.
          </p>
          <div className="flex items-center justify-center gap-3">
            <SignInButton />
            <Link
              href="/bonfida.sol"
              className="px-5 py-2.5 rounded-xl border border-brand-border text-gray-300 text-sm font-medium hover:border-brand-purple hover:text-white transition-colors"
            >
              View bonfida.sol →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Live Demo ── */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Live Identity Resolver</p>
            <p className="text-gray-400 text-sm">Resolve any .sol name — real data from Solana mainnet</p>
          </div>
          <LiveDemo />
        </div>
      </section>

      {/* ── Agent Identity ── */}
      <section className="border-t border-brand-border px-6 py-20">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-4 py-1.5 text-sm text-cyan-400">
              🤖 Agent Identity
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">
              The trust layer AI agents have been missing.
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Any autonomous agent can own a <code className="text-brand-purple">.sol</code> identity.
              Any protocol can verify it before granting access — without custom trust logic.
            </p>
          </div>
          <AgentGateInline />
          <div className="text-center">
            <Link
              href="/agent/bonfida.sol"
              className="inline-flex items-center gap-2 text-cyan-400 text-sm hover:underline"
            >
              View agent identity for bonfida.sol →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Infrastructure ── */}
      <section className="border-t border-brand-border px-6 py-20 bg-brand-card/20">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">For dApp Developers</p>
            <h2 className="text-3xl font-bold">Stop rebuilding identity from scratch.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UseCase
              title="DAO Access Gate"
              color="text-brand-purple"
              code={`const id = await getIdentity(
  domain, connection
)
const access =
  id.reputation.score >= 70`}
            />
            <UseCase
              title="Agent Authorization"
              color="text-cyan-400"
              code={`const agent = await getAgentIdentity(
  domain, connection
)
const ok =
  agent.capabilities
    .includes("payments")`}
            />
            <UseCase
              title="Sign In with .sol"
              color="text-brand-green"
              code={`const session = await signIn(
  { publicKey, signMessage },
  connection
)
// session.domain
// session.identity`}
            />
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="border-t border-brand-border px-6 py-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center">Why not ENS? Why not SNS?</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="text-left py-3 text-gray-500 font-medium w-1/2"></th>
                  <th className="py-3 text-gray-400 font-medium">ENS</th>
                  <th className="py-3 text-gray-400 font-medium">SNS alone</th>
                  <th className="py-3 text-brand-purple font-bold">SIK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {[
                  ["Human-readable name", true, true, true],
                  ["On-chain reputation", false, false, true],
                  ["Verifiable credentials", false, false, true],
                  ["Agent identity layer", false, false, true],
                  ["One SDK call", false, false, true],
                  ["Solana-native", false, true, true],
                ].map(([label, ens, sns, sik]) => (
                  <tr key={String(label)}>
                    <td className="py-3 text-gray-400">{label}</td>
                    <td className="py-3 text-center">{ens ? "✅" : "❌"}</td>
                    <td className="py-3 text-center">{sns ? "✅" : "❌"}</td>
                    <td className="py-3 text-center font-bold">{sik ? "✅" : "❌"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Packages ── */}
      <section className="border-t border-brand-border px-6 py-20 bg-brand-card/20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Open Source</p>
            <h2 className="text-3xl font-bold">Five packages. One protocol.</h2>
            <p className="text-gray-500 font-mono text-sm">npm install @sik-sdk/core</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: "@sik-sdk/core", desc: "getIdentity() — profile + reputation + credentials", color: "text-brand-purple" },
              { name: "@sik-sdk/reputation", desc: "On-chain reputation scoring engine (0–100)", color: "text-brand-green" },
              { name: "@sik-sdk/auth", desc: "signIn() — Sign In with .sol sessions", color: "text-brand-green" },
              { name: "@sik-sdk/agent", desc: "getAgentIdentity() — capabilities + trust score", color: "text-cyan-400" },
              { name: "@sik-sdk/credentials", desc: "SAS-backed verifiable on-chain attestations", color: "text-yellow-400" },
            ].map((pkg) => (
              <div key={pkg.name} className="bg-brand-card border border-brand-border rounded-xl p-4 space-y-1">
                <p className={`font-mono text-sm font-bold ${pkg.color}`}>{pkg.name}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{pkg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-brand-border px-6 py-6 flex items-center justify-between text-sm text-gray-500">
        <span>SIK · Solana Identity Kit</span>
        <div className="flex items-center gap-4">
          <Link href="https://github.com/thewoodfish/sik" target="_blank" className="hover:text-white transition-colors">GitHub</Link>
          <Link href="/docs/SIK-1" className="hover:text-white transition-colors">Protocol Spec</Link>
          <Link href="/demo/dao-gate" className="hover:text-white transition-colors">DAO Demo</Link>
        </div>
      </footer>
    </main>
  );
}

function UseCase({ title, color, code }: { title: string; color: string; code: string }) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-3">
      <p className={`font-bold text-sm ${color}`}>{title}</p>
      <pre className="text-xs font-mono text-gray-400 leading-relaxed whitespace-pre-wrap">{code}</pre>
    </div>
  );
}
