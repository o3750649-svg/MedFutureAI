import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    host: true, // السماح بالاتصال من أي آي بي
    allowedHosts: [
      'futuredoc-ai-amr.onrender.com', // رابط موقعك
      '.onrender.com', // أي رابط فرعي من ريندر
      'localhost',
      '4173-izn96wm1k1djjxre2q7h3-f2d7c1a6.sg1.manus.computer'
    ]
  },
  preview: {
    host: true,
    allowedHosts: [
      'futuredoc-ai-amr.onrender.com',
      '.onrender.com',
      'localhost',
      '4173-izn96wm1k1djjxre2q7h3-f2d7c1a6.sg1.manus.computer'
    ]
  }
})