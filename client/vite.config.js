import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      'process.env.FRONTEND': JSON.stringify(env.FRONTEND),
      'process.env.BACKEND': JSON.stringify(env.BACKEND),
      'process.env.CLIENT_ID': JSON.stringify(env.CLIENT_ID),
    },
  }
})
