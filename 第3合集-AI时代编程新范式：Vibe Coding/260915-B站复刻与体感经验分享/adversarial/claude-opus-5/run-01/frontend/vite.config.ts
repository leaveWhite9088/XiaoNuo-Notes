import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** 前端固定 3602，API 与媒体文件代理到后端固定端口 5602 */
const BACKEND = 'http://127.0.0.1:5602';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3602,
    strictPort: true,
    host: '127.0.0.1',
    proxy: {
      '/api': { target: BACKEND, changeOrigin: true },
      '/media': { target: BACKEND, changeOrigin: true },
    },
  },
  preview: {
    port: 3602,
    strictPort: true,
    proxy: {
      '/api': { target: BACKEND, changeOrigin: true },
      '/media': { target: BACKEND, changeOrigin: true },
    },
  },
});
