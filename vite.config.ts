import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Tailwind CSS v3 is configured via postcss.config.cjs
  // This allows Vite to automatically process Tailwind directives in src/index.css
})
