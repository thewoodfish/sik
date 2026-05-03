import Image from "next/image";
import type { SIKIdentity } from "@sik/core";

interface Props {
  identity: SIKIdentity;
}

export function IdentityCard({ identity }: Props) {
  const { domain, owner, profile, reputation } = identity;
  const score = reputation.score;

  const scoreColor =
    score >= 70
      ? "text-brand-green"
      : score >= 40
      ? "text-yellow-400"
      : "text-red-400";

  const socialLinks = [
    { label: "Twitter", value: profile.twitter, href: `https://twitter.com/${profile.twitter}` },
    { label: "GitHub", value: profile.github, href: `https://github.com/${profile.github}` },
    { label: "Discord", value: profile.discord, href: null },
    { label: "Telegram", value: profile.telegram, href: `https://t.me/${profile.telegram}` },
    { label: "Backpack", value: profile.backpack, href: null },
    { label: "URL", value: profile.url, href: profile.url },
  ].filter((l) => l.value);

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-5">
      {/* Header row */}
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-brand-border flex-shrink-0 overflow-hidden">
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
            <div className="w-full h-full flex items-center justify-center text-2xl text-brand-purple font-bold">
              {domain[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Name and owner */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-brand-purple">{domain}</h1>
          <p className="text-gray-500 text-sm font-mono truncate mt-1">{owner}</p>
        </div>

        {/* Reputation score */}
        <div className="text-center flex-shrink-0">
          <div className={`text-4xl font-bold ${scoreColor}`}>{score}</div>
          <div className="text-gray-500 text-xs mt-1">/ 100</div>
          <div className="text-gray-600 text-xs">reputation</div>
        </div>
      </div>

      {/* Social links */}
      {socialLinks.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-brand-border">
          {socialLinks.map(({ label, value, href }) => (
            <SocialBadge key={label} label={label} value={value!} href={href} />
          ))}
        </div>
      )}

      {/* Email */}
      {profile.email && (
        <p className="text-gray-400 text-sm">
          <span className="text-gray-600">email: </span>
          {profile.email}
        </p>
      )}
    </div>
  );
}

function SocialBadge({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string | null;
}) {
  const inner = (
    <span className="text-xs bg-brand-border text-gray-300 px-3 py-1 rounded-full hover:bg-brand-purple/20 hover:text-brand-purple transition-colors">
      {label}: {value}
    </span>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return inner;
}
