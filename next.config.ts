import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/restaurants/**",
      },
    ],
  },
};

export default nextConfig;
