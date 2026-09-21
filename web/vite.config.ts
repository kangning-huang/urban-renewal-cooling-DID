import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Custom domain root (cooling.kangning-huang.com)
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})