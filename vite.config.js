import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    // Warn if any chunk exceeds 500KB
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          // Supabase in its own chunk (heaviest dependency)
          'supabase': ['@supabase/supabase-js'],
          // React runtime separate from app code
          'react-vendor': ['react', 'react-dom'],
        }
      }
    }
  }
})
