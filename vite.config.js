import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  server: {
    port: 3007,
    allowedHosts:[
      'wpcadmin.govindvyas.com',
      'whitepandaadmin.com'
    ],
    proxy: {
      '/api': {
        target: 'https://wpcserver.govindvyas.com',
        changeOrigin: true
      },
      '/uploads': {
        target: 'https://wpcserver.govindvyas.com',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 3007,
    host: true
  }
})

