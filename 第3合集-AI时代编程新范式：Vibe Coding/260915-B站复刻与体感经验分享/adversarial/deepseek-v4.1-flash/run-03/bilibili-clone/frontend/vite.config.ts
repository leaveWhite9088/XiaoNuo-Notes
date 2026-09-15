import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/** 前端固定端口 3112；/api 与 /media 反向代理到后端 5112，避免跨域与防盗链问题 */
/** 开发与预览都要把 /api、/media 代理到后端 5112，否则 build 产物无法工作 */
const proxy = {
  '/api': { target: 'http://127.0.0.1:5112', changeOrigin: true },
  '/media': { target: 'http://127.0.0.1:5112', changeOrigin: true },
};

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3112,
    strictPort: true,
    host: '0.0.0.0',
    proxy,
  },
  preview: {
    port: 3112,
    strictPort: true,
    host: '0.0.0.0',
    proxy,
  },
});
