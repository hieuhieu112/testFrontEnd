export function getApiBaseUrl(env = process.env) {
  const rawUrl = env.API_BASE_URL?.trim() || env.VITE_API_BASE_URL?.trim()

  if (!rawUrl) {
    throw new Error('API_BASE_URL or VITE_API_BASE_URL is required. Set it before running npm dev/start.')
  }

  let url
  try {
    url = new URL(rawUrl)
  } catch {
    throw new Error('API_BASE_URL or VITE_API_BASE_URL must be an absolute http(s) URL.')
  }

  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('API_BASE_URL or VITE_API_BASE_URL must be an absolute http(s) URL without credentials, query, or hash.')
  }

  return url.href.replace(/\/$/, '')
}

export function getRuntimeConfigScript(env = process.env) {
  const apiBaseUrl = JSON.stringify(getApiBaseUrl(env)).replace(/</g, '\\u003c')
  return `window.__APP_CONFIG__ = Object.freeze({ apiBaseUrl: ${apiBaseUrl} });\n`
}
