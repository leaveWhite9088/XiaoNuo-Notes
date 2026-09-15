import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 前端固定 3801；/api 与 /static 代理到后端 5801
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3801,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://127.0.0.1:5801', changeOrigin: true },
      '/static': { target: 'http://127.0.0.1:5801', changeOrigin: true },
    },
  },
});
