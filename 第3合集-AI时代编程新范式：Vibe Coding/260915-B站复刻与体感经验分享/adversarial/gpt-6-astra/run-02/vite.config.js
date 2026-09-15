import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3302,
    strictPort: true,
    proxy: { "/api": "http://127.0.0.1:5302" },
  },
  preview: {
    port: 3302,
    strictPort: true,
    proxy: { "/api": "http://127.0.0.1:5302" },
  },
  test: { environment: "jsdom", setupFiles: ["./tests/setup.js"] },
});
