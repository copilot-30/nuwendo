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
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-v2.js`,
        chunkFileNames: `assets/[name]-[hash]-v2.js`,
      }
    }
  },
  server: {
    host: '0.0.0.0', // Allow external access
    port: 5173,
    strictPort: true,
    cors: true,
    allowedHosts: [
      'localhost',
      'nuwendo.dev',
      'www.nuwendo.dev',
      '.nuwendo.dev' // Allow all subdomains
    ],
  },
})
