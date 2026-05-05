import type { ReputationBreakdown } from "@sik-sdk/core";

interface Props {
  score: number;
  breakdown: ReputationBreakdown;
}

const SIGNALS: { key: keyof ReputationBreakdown; label: string; max: number; description: string }[] = [
  { key: "accountAge", label: "Account Age", max: 20, description: "Age of oldest on-chain transaction" },
  { key: "transactionVolume", label: "Transaction Volume", max: 20, description: "Log-scaled transaction count" },
  { key: "programDiversity", label: "Program Diversity", max: 20, description: "Unique programs interacted with" },
  { key: "daoParticipation", label: "DAO Participation", max: 20, description: "Governance program interactions" },
  { key: "solBalance", label: "SOL Balance", max: 10, description: "Current SOL holdings" },
  { key: "nftHoldings", label: "NFT Holdings", max: 10, description: "Token accounts with supply=1" },
];

export function ReputationBreakdownChart({ score, breakdown }: Props) {
  const scoreColor =
    score >= 70 ? "#14F195" : score >= 40 ? "#FACC15" : "#F87171";

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Reputation Breakdown</h2>
        <div className="text-sm text-gray-500">
          Computed entirely from public on-chain data · No oracles
        </div>
      </div>

      <div className="space-y-4">
        {SIGNALS.map(({ key, label, max, description }) => {
          const value = breakdown[key];
          const pct = (value / max) * 100;

          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-300 font-medium">{label}</span>
                  <span className="text-gray-600 ml-2 text-xs">{description}</span>
                </div>
                <span className="font-mono text-gray-300">
                  <span className="text-gray-500 mr-1">—</span>
                  <span className="text-gray-100 font-semibold text-base">{value}</span>
                  <span className="text-gray-600">/{max}</span>
                </span>
              </div>
              <div className="h-2 bg-brand-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: scoreColor,
                    opacity: pct === 0 ? 0.2 : 1,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-brand-border flex items-center justify-between text-sm">
        <span className="text-gray-500">Total</span>
        <span className="font-bold" style={{ color: scoreColor }}>
          {score} / 100
        </span>
      </div>
    </div>
  );
}
