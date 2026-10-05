import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import handler from '../../api/admin-feedback-status.js'
vi.mock('../../api/_lib/adminAuth.js', () => ({ validateAdminAccess: async () => true }))
beforeEach(() => {
  vi.stubEnv('SUPABASE_URL', 'https://example.invalid')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-only')
  vi.stubGlobal('fetch', vi.fn())
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })
async function invoke(feedbackId, method = 'PATCH', expectedStatus = 'new') {
  const response = { setHeader: vi.fn(), status: vi.fn(), json: vi.fn() }
  response.status.mockReturnValue(response)
  await handler({ method, headers: {}, body: { feedbackId, status: 'reviewed', expectedStatus } }, response)
  return response
}
describe('feedback update targeting', () => {
  it.each(['1&or=(id.gt.0)', {}, null, ''])('rejects malformed record identifiers', async (id) => {
    expect((await invoke(id)).status).toHaveBeenCalledWith(400)
    expect(fetch).not.toHaveBeenCalled()
  })
  it('requires PATCH', async () => {
    expect((await invoke('123', 'GET')).status).toHaveBeenCalledWith(405)
    expect(fetch).not.toHaveBeenCalled()
  })
  it('does not claim a missing row was updated', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => [] })
    expect((await invoke('123')).status).toHaveBeenCalledWith(409)
  })
  it('updates only the selected record and verifies the response', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => [{ id: '123', status: 'reviewed' }] })
    expect((await invoke('123')).status).toHaveBeenCalledWith(200)
    const [url, options] = fetch.mock.calls[0]
    expect(new URL(url).searchParams.get('id')).toBe('eq.123')
    expect(new URL(url).searchParams.get('status')).toBe('eq.new')
    expect(options.headers.Prefer).toBe('return=representation')
  })
  it('rejects unsupported original statuses before writing', async () => {
    expect((await invoke('123', 'PATCH', 'unknown')).status).toHaveBeenCalledWith(400)
    expect(fetch).not.toHaveBeenCalled()
  })
  it('matches a legacy null status explicitly', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => [{ id: '123', status: 'reviewed' }] })
    expect((await invoke('123', 'PATCH', null)).status).toHaveBeenCalledWith(200)
    expect(new URL(fetch.mock.calls[0][0]).searchParams.get('status')).toBe('is.null')
  })
  it('does not accept a mismatched confirmation', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => [{ id: '456', status: 'reviewed' }] })
    expect((await invoke('123')).status).toHaveBeenCalledWith(502)
  })
})
