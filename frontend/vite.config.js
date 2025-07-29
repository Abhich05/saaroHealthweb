import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    // Ensure environment variables are available at build time
    'process.env': {}
  },
  build: {
    // Ensure environment variables are properly included
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
