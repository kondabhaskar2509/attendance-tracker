import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'

  const frontend = (
    env.FRONTEND ||
    process.env.FRONTEND ||
    (isProd ? 'https://attendance-app-in.netlify.app' : 'http://localhost:5173')
  )
    .trim()
    .replace(/\/+$/, '')

  const backend = (
    env.BACKEND ||
    process.env.BACKEND ||
    (isProd ? 'https://attendance-tracker-43ng.onrender.com' : 'http://localhost:5000')
  )
    .trim()
    .replace(/\/+$/, '')

  const clientId = (
    env.CLIENT_ID ||
    process.env.CLIENT_ID ||
    'b0yVVrMLV8PnH-z0'
  ).trim()

  const redirectUri = (
    env.REDIRECT_URI ||
    process.env.REDIRECT_URI ||
    `${frontend}/signin`
  )
    .trim()
    .replace(/\/+$/, '')

  return {
    plugins: [react()],
    define: {
      'process.env.FRONTEND': JSON.stringify(frontend),
      'process.env.BACKEND': JSON.stringify(backend),
      'process.env.CLIENT_ID': JSON.stringify(clientId),
      'process.env.REDIRECT_URI': JSON.stringify(redirectUri),
    },
  }
})
