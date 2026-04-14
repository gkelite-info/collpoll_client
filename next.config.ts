// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "**",
//         pathname: "/**",
//       },
//     ],
//   },
// };

// export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/hikvision/:path*",
        destination: "http://192.168.31.170/:path*",
      },
    ];
  },
};

export default nextConfig;