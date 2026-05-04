"use client";

import { useState } from "react";
import Image from "next/image";
import type { SIKIdentity } from "@sik/core";

interface Props {
  identity: SIKIdentity;
}

function gradientFromDomain(domain: string): string {
  const c0 = domain.charCodeAt(0) ?? 65;
  const c1 = domain.charCodeAt(1) ?? 90;
  const hue1 = 270 + (c0 % 30);
  const hue2 = 120 + (c1 % 40);
  return `linear-gradient(135deg, hsl(${hue1},80%,55%), hsl(${hue2},80%,50%))`;
}

export function IdentityCard({ identity }: Props) {
  const { domain, owner, profile, reputation } = identity;
  const score = reputation.score;
  const [copied, setCopied] = useState(false);

  const scoreColor =
    score >= 70
      ? "text-brand-green"
      : score >= 40
      ? "text-yellow-400"
      : "text-red-400";

  const truncatedOwner = owner.slice(0, 4) + "..." + owner.slice(-4);

  const socialLinks: { key: string; value: string | null; href: string | null; icon: React.ReactNode }[] = [
    {
      key: "twitter",
      value: profile.twitter,
      href: profile.twitter ? `https://twitter.com/${profile.twitter}` : null,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: "github",
      value: profile.github,
      href: profile.github ? `https://github.com/${profile.github}` : null,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      key: "discord",
      value: profile.discord,
      href: null,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.099 18.08.11 18.1.12 18.113a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
        </svg>
      ),
    },
    {
      key: "telegram",
      value: profile.telegram,
      href: profile.telegram ? `https://t.me/${profile.telegram}` : null,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    {
      key: "url",
      value: profile.url,
      href: profile.url,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 15L15 9M11 9h4v4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ].filter((l) => l.value);

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-5">
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-full flex-shrink-0 overflow-hidden">
          {profile.avatar ? (
            <Image
              src={profile.avatar}
              alt={domain}
              width={64}
              height={64}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: gradientFromDomain(domain) }}
            >
              {domain[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-brand-purple">{domain}</h1>
          <p
            className="text-gray-500 text-sm font-mono mt-1"
            title={owner}
          >
            {truncatedOwner}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-center">
            <div className={`text-4xl font-bold ${scoreColor}`}>{score}</div>
            <div className="text-gray-500 text-xs mt-1">/ 100</div>
            <div className="text-gray-600 text-xs">reputation</div>
          </div>
          <button
            onClick={handleShare}
            className="text-xs text-gray-500 hover:text-brand-purple border border-brand-border hover:border-brand-purple/50 px-3 py-1 rounded-full transition-colors"
          >
            {copied ? "Copied!" : "Share"}
          </button>
        </div>
      </div>

      {socialLinks.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-brand-border">
          {socialLinks.map(({ key, value, href, icon }) => (
            <SocialIconButton key={key} label={key} value={value!} href={href} icon={icon} />
          ))}
        </div>
      )}

      {profile.email && (
        <p className="text-gray-400 text-sm">
          <span className="text-gray-600">email: </span>
          {profile.email}
        </p>
      )}
    </div>
  );
}

function SocialIconButton({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: string;
  href: string | null;
  icon: React.ReactNode;
}) {
  const className =
    "flex items-center gap-1.5 text-xs bg-brand-border text-gray-300 px-3 py-1.5 rounded-full hover:bg-brand-purple/20 hover:text-brand-purple transition-colors";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={className}
        title={`${label}: ${value}`}
      >
        {icon}
        <span className="sr-only">{label}</span>
      </a>
    );
  }

  return (
    <span className={className} title={`${label}: ${value}`}>
      {icon}
      <span className="sr-only">{label}</span>
    </span>
  );
}
