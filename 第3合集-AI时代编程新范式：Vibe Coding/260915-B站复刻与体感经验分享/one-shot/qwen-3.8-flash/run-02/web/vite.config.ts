import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 前端固定 3141，后端固定 5141；/api 与 /media 全部代理到后端
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3141,
    strictPort: true,
    proxy: {
      "/api": { target: "http://localhost:5141", changeOrigin: true },
      "/media": { target: "http://localhost:5141", changeOrigin: true },
    },
  },
});
