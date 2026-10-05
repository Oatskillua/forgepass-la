import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import handler from './events.js'
beforeEach(() => { vi.stubEnv('TICKETMASTER_API_KEY', 'test-secret'); vi.stubGlobal('fetch', vi.fn()) })
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers() })
async function invoke(query = {}, method = 'GET') {
  const response = { setHeader: vi.fn(), status: vi.fn(), json: vi.fn() }
  response.status.mockReturnValue(response)
  await handler({ method, query, headers: {} }, response)
  return response
}
it.each([{ city: ['LA', 'NY'] }, { keyword: {} }, { keyword: 'a'.repeat(201) }, { city: '' }, { size: '0' }, { size: '51' }, { size: '2.5' }])('rejects invalid input before provider access: %j', async (query) => {
  expect((await invoke(query)).status).toHaveBeenCalledWith(400)
  expect(fetch).not.toHaveBeenCalled()
})
it('rejects unsupported methods and handles unavailable configuration', async () => {
  expect((await invoke({}, 'POST')).status).toHaveBeenCalledWith(405)
  vi.stubEnv('TICKETMASTER_API_KEY', '')
  const res = await invoke()
  expect(res.status).toHaveBeenCalledWith(503)
  expect(fetch).not.toHaveBeenCalled()
})
it('encodes searches and returns only normalized display fields', async () => {
  fetch.mockResolvedValue({ ok: true, json: async () => ({ _embedded: { events: [{ id: 'e1', name: 'Concert', url: 'https://tickets.example/event', images: [{ url: 'javascript:alert(1)' }], internal: 'unused' }] } }) })
  const res = await invoke({ keyword: ' A & B ', size: '12' })
  const [url, options] = fetch.mock.calls[0]
  expect(url.searchParams.get('keyword')).toBe('A & B')
  expect(url.searchParams.get('city')).toBe('Los Angeles')
  expect(options.redirect).toBe('error')
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ events: [{ id: 'e1', name: 'Concert', url: 'https://tickets.example/event', image: '', venue: '', city: '', date: '', time: '' }] }))
})
it('distinguishes confirmed empty results from malformed provider data', async () => {
  for (const data of [{}, { _embedded: { events: 'wrong' } }, { _embedded: { events: [{ id: 'e1', name: 'Event', url: 'javascript:alert(1)' }] } }]) {
    fetch.mockResolvedValue({ ok: true, json: async () => data })
    expect((await invoke()).status).toHaveBeenCalledWith(502)
  }
  fetch.mockResolvedValue({ ok: true, json: async () => ({ page: { totalElements: 0 } }) })
  expect((await invoke()).json).toHaveBeenCalledWith(expect.objectContaining({ events: [], hasMore: false }))
})
it('does not expose provider errors or credentials', async () => {
  fetch.mockRejectedValue(new Error('https://provider?apikey=test-secret'))
  const res = await invoke()
  expect(res.status).toHaveBeenCalledWith(502)
  expect(JSON.stringify(res.json.mock.calls)).not.toContain('test-secret')
})
it('aborts a slow provider and returns a retryable timeout', async () => {
  vi.useFakeTimers()
  fetch.mockImplementation((_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')))))
  const pending = invoke()
  await vi.advanceTimersByTimeAsync(8000)
  const res = await pending
  expect(res.status).toHaveBeenCalledWith(504)
  expect(res.json).toHaveBeenCalledWith({ error: 'Event search timed out. Please try again.' })
  expect(vi.getTimerCount()).toBe(0)
})

it.each(['-1', '1.2', ['1'], '999'])('rejects invalid or inaccessible page %j', async (page) => {
  expect((await invoke({ page })).status).toHaveBeenCalledWith(400)
  expect(fetch).not.toHaveBeenCalled()
})
it('forwards page numbers and stops paging at the provider search boundary', async () => {
  fetch.mockResolvedValue({ ok: true, json: async () => ({ _embedded: { events: [] }, page: { number: 1, totalPages: 100 } }) })
  expect((await invoke({ page: '1' })).json).toHaveBeenCalledWith(expect.objectContaining({ page: 1, hasMore: true, searchLimitReached: false }))
  expect(fetch.mock.calls[0][0].searchParams.get('page')).toBe('1')
  fetch.mockResolvedValue({ ok: true, json: async () => ({ _embedded: { events: [] }, page: { number: 83, totalPages: 100 } }) })
  expect((await invoke({ page: '83' })).json).toHaveBeenCalledWith(expect.objectContaining({ page: 83, hasMore: false, searchLimitReached: true }))
})
it('rejects mismatched provider page metadata', async () => {
  fetch.mockResolvedValue({ ok: true, json: async () => ({ _embedded: { events: [] }, page: { number: 2, totalPages: 3 } }) })
  expect((await invoke({ page: '1' })).status).toHaveBeenCalledWith(502)
})
