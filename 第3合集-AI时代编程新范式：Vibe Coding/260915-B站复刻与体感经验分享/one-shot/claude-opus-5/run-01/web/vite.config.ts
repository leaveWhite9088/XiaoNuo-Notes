import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * 前端固定 3601 端口，/api 与 /media 反向代理到后端 5601。
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3601,
    strictPort: true,
    host: '127.0.0.1',
    proxy: {
      '/api': { target: 'http://127.0.0.1:5601', changeOrigin: true },
      '/media': { target: 'http://127.0.0.1:5601', changeOrigin: true },
    },
  },
  preview: {
    port: 3601,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://127.0.0.1:5601', changeOrigin: true },
      '/media': { target: 'http://127.0.0.1:5601', changeOrigin: true },
    },
  },
});
