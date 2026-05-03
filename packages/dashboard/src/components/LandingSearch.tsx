"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LandingSearch() {
  const [value, setValue] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const domain = (value.trim() || "bonfida").toLowerCase().replace(/\.sol$/, "");
    router.push(`/${domain}.sol`);
  }

  return (
    <div className="space-y-3 max-w-md mx-auto w-full">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="bonfida.sol"
          className="flex-1 bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple transition-colors"
        />
        <button
          type="submit"
          className="bg-brand-purple hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Look up
        </button>
      </form>
      <p className="text-center text-sm text-gray-600">
        or{" "}
        <Link
          href="/bonfida.sol"
          className="text-brand-purple hover:underline font-medium"
        >
          see the bonfida.sol demo →
        </Link>
      </p>
    </div>
  );
}
