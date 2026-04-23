import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Asegúrate de tener esta importación

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Asegúrate de que esto esté aquí
  ],
})