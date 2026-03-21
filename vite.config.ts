import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Tailwind CSS v3 is configured via postcss.config.cjs
  // This allows Vite to automatically process Tailwind directives in src/index.css
  server: {
    proxy: {
      // Proxy /api requests to backend during development
      // This avoids CORS issues since the request appears to come from localhost
      '/api': {
        target: 'https://finly.uyqidir.uz',
        changeOrigin: true,
        rewrite: (path) => path, // Keep /api in the path
      },
    },
  },
})
