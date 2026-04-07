import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Bind IPv4 explicitly (some Windows setups resolve "localhost" oddly)
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
    open: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    open: true,
  },
})
