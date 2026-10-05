import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { apiFetch } from './apiFetch'
const platform = vi.hoisted(() => ({ native: false }))
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => platform.native } }))
beforeEach(() => { platform.native = false; vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true })) })
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })

it('keeps browser calls same-origin', async () => {
  vi.stubEnv('VITE_API_ORIGIN', 'https://api.example')
  await apiFetch('/api/events?keyword=music')
  expect(fetch).toHaveBeenCalledWith('/api/events?keyword=music', undefined)
})
it('routes native calls to HTTPS and preserves bearer tokens, bodies and cancellation', async () => {
  platform.native = true
  vi.stubEnv('VITE_API_ORIGIN', 'https://api.example')
  const options = { method: 'PATCH', headers: { Authorization: 'Bearer test' }, body: '{}', signal: new AbortController().signal }
  await apiFetch('/api/admin-feedback-status', options)
  expect(fetch).toHaveBeenCalledWith('https://api.example/api/admin-feedback-status', { ...options, credentials: 'omit', redirect: 'error' })
})
it('blocks unconfigured native calls before sending any request', async () => {
  platform.native = true
  vi.stubEnv('VITE_API_ORIGIN', '')
  await expect(apiFetch('/api/events')).rejects.toThrow('unavailable')
  expect(fetch).not.toHaveBeenCalled()
})
it.each(['https://other.example/api/events', '//other.example', '/api/../secret', '/api/events#fragment'])('rejects unsupported endpoint %s', async (endpoint) => {
  await expect(apiFetch(endpoint)).rejects.toThrow('Unsupported')
  expect(fetch).not.toHaveBeenCalled()
})
