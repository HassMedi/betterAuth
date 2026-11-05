import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Exposes the local D1/R2 bindings from the generated Wrangler config during
// `next dev`, so auth can use the same D1 database locally as it does deployed.
initOpenNextCloudflareForDev({ configPath: "./freebuff.wrangler.jsonc" });

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
