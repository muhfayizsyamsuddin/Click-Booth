import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["res.cloudinary.com"],
    // remotePatterns: [
    //   {
    //     protocol: "https",
    //     hostname: "res.cloudinary.com",
    //     pathname: "/:path*", // izinkan semua path di host ini
    //   },
    // ],
  },
  // Turbopack configuration
  turbopack: {
    root: __dirname,
  },
  // Additional config for better chunk loading
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Webpack fallback for better compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
