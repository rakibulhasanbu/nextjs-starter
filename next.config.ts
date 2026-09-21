import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // The backend has no CORS configured, so client-side fetches (lib/api-client.ts)
  // go through this same-origin proxy instead of hitting it directly from the browser.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${process.env.NEXT_PUBLIC_SERVER_URL}/:path*` }];
  },
};

export default nextConfig;
