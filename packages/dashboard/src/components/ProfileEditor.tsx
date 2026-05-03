"use client";

import { useState } from "react";

interface Props {
  domain: string;
}

/**
 * Profile editing UI — triggers SNS Records V2 writes via connected wallet.
 * Full implementation requires a transaction flow; this renders the trigger.
 */
export function ProfileEditor({ domain }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm bg-brand-purple/10 text-brand-purple border border-brand-purple/30 hover:bg-brand-purple/20 px-3 py-1.5 rounded-lg transition-colors"
      >
        Edit profile
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bg-brand-card border border-brand-border rounded-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Edit {domain}</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-400 text-sm">
              Update your SNS Records V2 — changes are written on-chain and
              reflected in your SIK identity immediately.
            </p>

            <div className="space-y-3">
              {FIELDS.map(({ name, placeholder, record }) => (
                <div key={name} className="space-y-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">
                    {name}
                  </label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full bg-brand-border/40 border border-brand-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-purple transition-colors"
                    data-record={record}
                  />
                </div>
              ))}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 bg-brand-border text-gray-300 hover:bg-brand-border/80 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-brand-purple hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                onClick={() => {
                  // TODO: collect field values, build SNS Record V2 update
                  // transactions, and send via connected wallet.
                  // Full implementation in SIK-1 release build.
                  alert("On-chain record update — coming in the full release.");
                }}
              >
                Save on-chain
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const FIELDS = [
  { name: "Twitter", placeholder: "@handle", record: "Twitter" },
  { name: "GitHub", placeholder: "username", record: "Github" },
  { name: "Discord", placeholder: "username#0000", record: "Discord" },
  { name: "Telegram", placeholder: "@handle", record: "Telegram" },
  { name: "URL", placeholder: "https://yoursite.com", record: "Url" },
  { name: "Email", placeholder: "you@example.com", record: "Email" },
];
