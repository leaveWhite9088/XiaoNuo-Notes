import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 前端固定 3132；/api 与 /media 全部代理到后端 5132（同源，无跨域问题）
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 3132,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5132',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:5132',
        changeOrigin: true,
      },
    },
  },
});
