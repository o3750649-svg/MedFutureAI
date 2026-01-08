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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          gemini: ['@google/genai'],
          supabase: ['@supabase/supabase-js']
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
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@google/genai', '@supabase/supabase-js']
  }
})