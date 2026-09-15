import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    watch: {
      ignored: ['**/tmp-verify/**', '**/node_modules/**']
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3002',
        changeOrigin: true
      }
    }
  }
})
