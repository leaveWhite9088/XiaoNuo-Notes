import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5317,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3317',
        changeOrigin: true,
      },
    },
  },
});
