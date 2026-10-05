import { afterEach, expect, it, vi } from 'vitest'
import { handleCors } from './cors.js'
import metrics from '../admin-metrics.js'
const auth = vi.hoisted(() => ({ validateAdminAccess: vi.fn(async () => false) }))
vi.mock('./adminAuth.js', () => auth)
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks() })
function response() {
  const result = { setHeader: vi.fn(), status: vi.fn(), json: vi.fn(), end: vi.fn() }
  result.status.mockReturnValue(result)
  return result
}
it('handles an allowed native preflight before authentication', async () => {
  vi.stubEnv('API_ALLOWED_ORIGINS', 'https://localhost,capacitor://localhost')
  const res = response()
  await metrics({ method: 'OPTIONS', headers: { origin: 'capacitor://localhost', 'access-control-request-method': 'GET', 'access-control-request-headers': 'authorization' } }, res)
  expect(res.status).toHaveBeenCalledWith(204)
  expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'capacitor://localhost')
  expect(auth.validateAdminAccess).not.toHaveBeenCalled()
})
it('still requires admin authorization for actual requests', async () => {
  vi.stubEnv('API_ALLOWED_ORIGINS', 'https://localhost')
  const res = response()
  await metrics({ method: 'GET', headers: { origin: 'https://localhost' } }, res)
  expect(res.status).toHaveBeenCalledWith(401)
  expect(auth.validateAdminAccess).toHaveBeenCalledOnce()
})
it.each(['https://other.example', 'null', 'https://localhost.evil.example'])('rejects preflight from %s', (origin) => {
  vi.stubEnv('API_ALLOWED_ORIGINS', 'https://localhost')
  const res = response()
  expect(handleCors({ method: 'OPTIONS', headers: { origin, 'access-control-request-method': 'GET' } }, res, 'GET')).toBe(true)
  expect(res.status).toHaveBeenCalledWith(403)
  expect(res.setHeader.mock.calls.some(([name]) => name === 'Access-Control-Allow-Origin')).toBe(false)
})
it('rejects unexpected methods and headers and leaves same-origin calls usable', () => {
  vi.stubEnv('API_ALLOWED_ORIGINS', 'https://localhost')
  for (const headers of [{ 'access-control-request-method': 'DELETE' }, { 'access-control-request-method': 'GET', 'access-control-request-headers': 'x-custom' }]) {
    const res = response()
    handleCors({ method: 'OPTIONS', headers: { origin: 'https://localhost', ...headers } }, res, 'GET')
    expect(res.status).toHaveBeenCalledWith(403)
  }
  expect(handleCors({ method: 'GET', headers: {} }, response(), 'GET')).toBe(false)
})
