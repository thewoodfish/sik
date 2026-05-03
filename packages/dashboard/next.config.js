/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@sik/core", "@sik/reputation"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  webpack: (config) => {
    // Solana web3.js uses Node.js built-ins
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      os: false,
      path: false,
      crypto: false,
    };
    return config;
  },
};

module.exports = nextConfig;
