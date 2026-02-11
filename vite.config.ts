import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/mahjong-calculator-web/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
      manifest: {
        name: 'まじゃっぴー（麻雀点数計算アプリ）',
        short_name: 'まじゃっぴー',
        description:
          '麻雀の手牌を入力するだけで翻数・符・点数を自動計算。リーチ・ツモ・ドラなどの条件にも対応。',
        theme_color: '#1e293b',
        background_color: '#1e293b',
        display: 'standalone',
        scope: '/mahjong-calculator-web/',
        start_url: '/mahjong-calculator-web/',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
