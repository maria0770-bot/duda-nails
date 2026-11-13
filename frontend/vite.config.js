
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    proxy: {
      '/hello': {
        target: 'http://host.docker.internal:3000',
        changeOrigin: true,
      },
    },
  },
})
