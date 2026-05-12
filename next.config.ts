import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/restaurants",
        destination: "/dashboard/restaurantes",
        permanent: true,
      },
      {
        source: "/dashboard/restaurants/:path+",
        destination: "/dashboard/restaurantes/:path+",
        permanent: true,
      },
    ];
  },
  images: {
    localPatterns: [
      {
        pathname: "/restaurants/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
