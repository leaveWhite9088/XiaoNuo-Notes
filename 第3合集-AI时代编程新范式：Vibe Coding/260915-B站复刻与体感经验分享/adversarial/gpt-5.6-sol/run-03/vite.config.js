import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3402,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:5402'
    }
  },
  preview: {
    port: 3402,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:5402'
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    clearMocks: true
  }
})
