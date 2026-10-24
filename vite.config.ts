/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Vitrier',
        short_name: 'Vitrier',
        description: 'Calculatrice pouces/millimètres et diviseur de longueur',
        lang: 'fr',
        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#ffffff',
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
  },
})
