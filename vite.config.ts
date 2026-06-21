import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  plugins: [], // 👈 REQUIRED (this is what Wrangler is complaining about)

  tanstackStart: {
    server: {
      entry: "server",
    },
  },

  vite: {
    // optional extra vite config if needed
  },
});
