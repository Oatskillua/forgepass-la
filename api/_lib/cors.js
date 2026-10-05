export function handleCors(request, response, method) {
  const origin = request.headers?.origin
  const allowed = (process.env.API_ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean)
  const permitted = typeof origin === 'string' && origin !== 'null' && allowed.includes(origin)
  response.setHeader('Vary', 'Origin')
  if (permitted) {
    response.setHeader('Access-Control-Allow-Origin', origin)
    response.setHeader('Access-Control-Expose-Headers', 'Content-Type')
  }
  if (request.method !== 'OPTIONS') return false
  response.setHeader('Cache-Control', 'no-store')
  const headers = String(request.headers?.['access-control-request-headers'] || '').toLowerCase().split(',').map((value) => value.trim()).filter(Boolean)
  if (!permitted || request.headers?.['access-control-request-method'] !== method || headers.some((value) => !['authorization', 'content-type'].includes(value))) {
    response.status(403).json({ error: 'Cross-origin request not allowed.' })
    return true
  }
  response.setHeader('Access-Control-Allow-Methods', method)
  response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  response.status(204).end()
  return true
}
