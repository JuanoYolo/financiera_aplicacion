import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false }, // para probar en npm run dev
      manifest: {
        name: 'FinanJuano',
        short_name: 'FinanJuano',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b0f1a',
        theme_color: '#0ea5e9',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})