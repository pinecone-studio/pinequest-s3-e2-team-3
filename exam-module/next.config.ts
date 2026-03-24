import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

// We wrap the setup in a function to avoid the "Top-Level Await" error
if (process.env.NODE_ENV === "development") {
  (async () => {
    try {
      const { setupDevPlatform } = await import("@cloudflare/next-on-pages/next-dev");
      await setupDevPlatform();
      console.log("✅ Cloudflare Dev Platform Ready");
    } catch (error) {
      console.error("❌ Failed to setup Cloudflare Dev Platform:", error);
    }
  })();
}

export default nextConfig;