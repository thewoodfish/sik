"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { signIn, SIKAuthError } from "@sik/auth";

export function SignInButton() {
  const { publicKey, signMessage, connected } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!connected) return null;

  async function handleSignIn() {
    if (!publicKey || !signMessage) return;
    setLoading(true);
    setError(null);
    try {
      const session = await signIn({ publicKey, signMessage }, connection);
      localStorage.setItem("sik_session", JSON.stringify(session));
      router.push(`/${session.domain}`);
    } catch (err) {
      if (err instanceof SIKAuthError && err.code === "NO_DOMAIN") {
        setError("No .sol name found. Register at naming.bonfida.org");
      } else {
        setError("Sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="px-6 py-2.5 rounded-lg bg-brand-purple text-white font-medium text-sm hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Signing in…" : "Sign in with .sol"}
      </button>
      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}
    </div>
  );
}
