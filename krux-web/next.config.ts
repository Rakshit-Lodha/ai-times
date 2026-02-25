import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wbssuitpowuljcvazlnd.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/ga/js",
        destination: "https://www.googletagmanager.com/gtag/js",
      },
      {
        source: "/ga/collect",
        destination: "https://www.google-analytics.com/g/collect",
      },
    ];
  },
};

export default nextConfig;
