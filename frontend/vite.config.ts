import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0', // Allow external access
    port: 5173,
    strictPort: true,
    hmr: {
      // Only use port 443 for production through Cloudflare
      clientPort: process.env.NODE_ENV === 'production' ? 443 : 5173,
    },
    cors: true,
    allowedHosts: [
      'localhost',
      'nuwendo.dev',
      'www.nuwendo.dev',
      '.nuwendo.dev' // Allow all subdomains
    ],
  },
})
