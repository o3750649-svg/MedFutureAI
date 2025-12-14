import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disabling source maps saves significant memory
    chunkSizeWarningLimit: 1600,
  },
  server: {
    host: true, 
    allowedHosts: [
      'futuredoc-ai-amr.onrender.com',
      '.onrender.com',
      'localhost'
    ],
    watch: {
      usePolling: false, // Polling uses high CPU/RAM
    }
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: [
      'futuredoc-ai-amr.onrender.com',
      '.onrender.com',
      'localhost'
    ]
  }
})