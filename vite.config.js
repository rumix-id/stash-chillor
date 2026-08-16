import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Trick the browser: every request to /graphql will be silently redirected to Stash
      '/graphql': {
        target: 'http://localhost:9999',
        changeOrigin: true,
      }
    }
  }
})