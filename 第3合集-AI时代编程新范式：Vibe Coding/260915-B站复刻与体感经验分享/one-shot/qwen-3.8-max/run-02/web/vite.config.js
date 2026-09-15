import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 前端固定端口 3131；/api 代理到后端 5131
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3131,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5131',
        changeOrigin: true
      }
    }
  }
});
