import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getApiBaseUrl, getRuntimeConfigScript } from './runtime-config.mjs'

const distDir = resolve(fileURLToPath(new URL('../dist/', import.meta.url)))
const configScript = getRuntimeConfigScript()
const port = Number(process.env.PORT || 4173)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.')
}

const contentTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

createServer(async (request, response) => {
  let pathname
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  } catch {
    response.writeHead(400).end('Bad request')
    return
  }

  if (pathname === '/config.js') {
    response.writeHead(200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
    }).end(configScript)
    return
  }

  const filePath = resolve(distDir, `.${pathname}`)
  if (filePath !== distDir && !filePath.startsWith(distDir + sep)) {
    response.writeHead(403).end('Forbidden')
    return
  }

  try {
    const file = await stat(filePath).then(info => info.isFile() ? filePath : resolve(filePath, 'index.html'))
    const body = await readFile(file)
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(file)] || 'application/octet-stream',
    }).end(body)
  } catch {
    if (request.headers.accept?.includes('text/html')) {
      try {
        const body = await readFile(resolve(distDir, 'index.html'))
        response.writeHead(200, { 'Content-Type': 'text/html' }).end(body)
        return
      } catch {
        // Report missing build output below.
      }
    }
    response.writeHead(404).end('Not found. Run npm run build first.')
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`Frontend serving on port ${port}; API: ${getApiBaseUrl()}`)
})
