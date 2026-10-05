import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import waitlist from './waitlist.js'
import feedback from './feedback.js'
vi.mock('./_lib/rateLimit.js', () => ({ checkRateLimit: () => ({ allowed: true }), getClientIp: () => 'test-ip' }))
beforeEach(() => {
  vi.stubEnv('SUPABASE_URL', 'https://database.example')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'server-secret')
  vi.stubEnv('TURNSTILE_SECRET_KEY', 'challenge-secret')
  vi.stubGlobal('fetch', vi.fn())
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers() })
const body = { name: 'Tester', email: 'TEST@example.com', city: 'LA', interest: 'Events', category: 'Product', message: 'Useful feedback', turnstileToken: 'challenge' }
async function invoke(handler, payload = body) {
  const response = { setHeader: vi.fn(), status: vi.fn(), json: vi.fn() }
  response.status.mockReturnValue(response)
  await handler({ method: 'POST', headers: {}, body: payload }, response)
  return response
}
describe.each([['waitlist', waitlist], ['feedback', feedback]])('%s server submissions', (name, handler) => {
  it('verifies the challenge before a single database insert and shares the timeout signal', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) }).mockResolvedValueOnce({ ok: true })
    const res = await invoke(handler)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
    expect(fetch).toHaveBeenCalledTimes(2)
    const [url, options] = fetch.mock.calls[1]
    expect(url).toBe(`https://database.example/rest/v1/${name}`)
    expect(JSON.parse(options.body).email).toBe('test@example.com')
    expect(options.signal).toBe(fetch.mock.calls[0][1].signal)
    expect(options.redirect).toBe('error')
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store')
  })
  it('rejects missing challenges without provider or database access', async () => {
    expect((await invoke(handler, { ...body, turnstileToken: {} })).status).toHaveBeenCalledWith(403)
    expect(fetch).not.toHaveBeenCalled()
  })
  it('never treats truthy malformed challenge responses as verification', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ success: 'true' }) })
    expect((await invoke(handler)).status).toHaveBeenCalledWith(503)
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it('does not echo database bodies or exception details into responses or logs', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'private@example.com server-secret' })
    const failed = await invoke(handler)
    expect(failed.status).toHaveBeenCalledWith(500)
    fetch.mockRejectedValue(new Error('challenge-secret private@example.com'))
    const thrown = await invoke(handler)
    expect(thrown.status).toHaveBeenCalledWith(503)
    expect(JSON.stringify([failed.json.mock.calls, thrown.json.mock.calls, console.error.mock.calls])).not.toMatch(/private@example.com|server-secret|challenge-secret/)
  })
  it.each(['verification', 'insert'])('times out during %s without automatically retrying', async (stage) => {
    vi.useFakeTimers()
    const pendingFetch = (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('abort'))))
    if (stage === 'insert') fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
    fetch.mockImplementation(pendingFetch)
    const pending = invoke(handler)
    await vi.advanceTimersByTimeAsync(10000)
    const res = await pending
    expect(res.status).toHaveBeenCalledWith(504)
    expect(res.json).toHaveBeenCalledWith({ error: 'Submission timed out. Its status could not be confirmed.' })
    expect(fetch).toHaveBeenCalledTimes(stage === 'insert' ? 2 : 1)
    expect(vi.getTimerCount()).toBe(0)
  })
})
it('preserves the waitlist duplicate response without reading database error details', async () => {
  const readBody = vi.fn()
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) }).mockResolvedValueOnce({ ok: false, status: 409, text: readBody })
  expect((await invoke(waitlist)).status).toHaveBeenCalledWith(409)
  expect(readBody).not.toHaveBeenCalled()
})
