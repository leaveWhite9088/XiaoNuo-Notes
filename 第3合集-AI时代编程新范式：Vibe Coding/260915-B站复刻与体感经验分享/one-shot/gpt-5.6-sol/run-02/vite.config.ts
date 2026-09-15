import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3401,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:5401'
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 3401,
    strictPort: true
  }
})
