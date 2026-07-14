import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/mcp/',
  build: {
    outDir: '../mcp_lens/static',
    emptyOutDir: true
  }
})
