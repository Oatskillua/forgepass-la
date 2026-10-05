import { afterEach, expect, it, vi } from 'vitest'
import events from './events.js'
import waitlist from './waitlist.js'
import feedback from './feedback.js'
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })
it.each([['events', events, 'GET', 30], ['waitlist', waitlist, 'POST', 5], ['feedback', feedback, 'POST', 5]])('throttles %s before further provider requests', async (name, handler, method, limit) => {
  vi.stubEnv('TICKETMASTER_API_KEY', 'test-key')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ page: { totalElements: 0 } }) }))
  let response
  for (let index = 0; index <= limit; index++) {
    response = { status: vi.fn(), json: vi.fn(), setHeader: vi.fn() }
    response.status.mockReturnValue(response)
    await handler({ method, headers: { 'x-real-ip': '192.0.2.90' }, query: {}, body: {} }, response)
    if (index < limit) expect(response.status).not.toHaveBeenCalledWith(429)
  }
  expect(response.status).toHaveBeenCalledWith(429)
  expect(response.setHeader).toHaveBeenCalledWith('Retry-After', expect.stringMatching(/^\d+$/))
  expect(fetch).toHaveBeenCalledTimes(name === 'events' ? limit : 0)
})
