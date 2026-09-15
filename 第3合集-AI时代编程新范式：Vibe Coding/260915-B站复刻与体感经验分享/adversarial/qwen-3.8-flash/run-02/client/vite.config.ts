import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 前端固定 3142；/api 代理固定到后端 5142（与 README、后端端口一致）
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3142,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5142',
        changeOrigin: true,
      },
    },
  },
});
