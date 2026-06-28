import { defineConfig } from "@lovable.dev/vite-tanstack-config";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [cloudflare({
    viteEnvironment: {
      name: "ssr"
    }
  })], // 👈 REQUIRED (this is what Wrangler is complaining about)

  tanstackStart: {
    server: {
      entry: "server",
    },
  },

  vite: {
    // optional extra vite config if needed
  },
});