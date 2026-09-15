import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 3002,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4040',
        changeOrigin: true,
      },
    },
  },
});
