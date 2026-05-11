"use client";

import { useState } from "react";

export function DevCallout({ domain }: { domain: string }) {
  const [copied, setCopied] = useState(false);
  const snippet = `getIdentity("${domain}", connection)`;

  function copy() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-5 flex items-center justify-between gap-4">
      <div className="space-y-1 min-w-0">
        <p className="text-gray-500 text-xs">Integrate this identity in your app:</p>
        <p className="font-mono text-sm text-brand-green truncate">{snippet}</p>
      </div>
      <button
        onClick={copy}
        className="shrink-0 text-xs px-3 py-1.5 rounded-lg border border-brand-border text-gray-400 hover:text-white hover:border-brand-purple transition-colors"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
