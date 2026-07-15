import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Separate admin app. Runs on its own dev server / build, independent of the
// public OrchillaLand site, but shares the same design tokens (see index.css).
// https://vite.dev/config/
export default defineConfig({
  server: { port: 5174 },
  plugins: [
    react(),
    tailwindcss(),
  ],
})
