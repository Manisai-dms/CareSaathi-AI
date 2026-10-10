import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/AppData/**',
        `${process.env.APPDATA}/**`,
        `${process.env.LOCALAPPDATA}/**`,
      ],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})
