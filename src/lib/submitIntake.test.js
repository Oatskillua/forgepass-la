import { afterEach, describe, expect, it, vi } from 'vitest'
import { submitIntake } from './submitIntake'

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })
describe('intake request transport', () => {
  it('aborts an overdue request and reports uncertain delivery', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    })))
    const result = expect(submitIntake('/api/waitlist', {}, 100)).rejects.toThrow('status is unknown')
    await vi.advanceTimersByTimeAsync(100)
    await result
  })
  it.each([[409, 'already on the waitlist'], [429, 'Too many requests'], [403, 'Security check failed']])('handles status %s', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status, json: async () => ({ error: 'Internal detail' }) }))
    await expect(submitIntake('/api/waitlist', {})).rejects.toThrow(message)
  })
})
