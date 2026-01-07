import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
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