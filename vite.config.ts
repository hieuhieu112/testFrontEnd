import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { getRuntimeConfigScript } from './scripts/runtime-config.mjs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', ['API_BASE_URL', 'VITE_API_BASE_URL'])

  return {
    plugins: [
      react(),
      {
        name: 'runtime-config',
        transformIndexHtml: {
          order: 'post',
          handler(html) {
            return html.replace('</head>', '  <script src="/config.js"></script>\n  </head>')
          },
        },
        configureServer(server) {
          server.middlewares.use('/config.js', (_request, response) => {
            try {
              response.setHeader('Content-Type', 'application/javascript; charset=utf-8')
              response.setHeader('Cache-Control', 'no-store')
              response.end(getRuntimeConfigScript(env))
            } catch (error) {
              response.statusCode = 500
              response.end(error instanceof Error ? error.message : String(error))
            }
          })
        },
      },
    ],
  }
})
