import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Forward /api requests to the Express backend during development
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Proxy NOAA requests to avoid CORS
      '/proxy-noaa': {
        target: 'https://services.swpc.noaa.gov',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/proxy-noaa/, ''),
        secure: false,
      },
      // Proxy Nominatim (OpenStreetMap) requests to avoid CORS
      '/proxy-nominatim': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/proxy-nominatim/, ''),
        secure: false,
      },
      // Proxy Astronomy API requests to avoid CORS
      '/proxy-astronomy': {
        target: 'https://api.astronomyapi.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/proxy-astronomy/, ''),
        secure: false,
      },
    },
  },
})
