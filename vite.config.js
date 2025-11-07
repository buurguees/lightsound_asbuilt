import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Permite acceso desde la red local
    port: 5173, // Puerto por defecto de Vite
  },
})
