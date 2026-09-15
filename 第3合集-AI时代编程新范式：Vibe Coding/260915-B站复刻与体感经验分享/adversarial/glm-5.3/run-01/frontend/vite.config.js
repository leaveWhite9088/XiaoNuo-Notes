import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 前端固定 3802；/api 与 /media 统一代理到后端 5802（与 README、后端端口保持一致）
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3802,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://localhost:5802', changeOrigin: true },
      '/media': { target: 'http://localhost:5802', changeOrigin: true },
    },
  },
});
