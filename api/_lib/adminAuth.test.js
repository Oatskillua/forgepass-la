import { beforeEach, describe, expect, it, vi } from 'vitest'
import { validateAdminAccess } from './adminAuth.js'

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), maybeSingle: vi.fn(), create: vi.fn() }))
vi.mock('./supabaseAdmin.js', () => ({ createSupabaseAdminClient: mocks.create }))
const request = { headers: { authorization: 'Bearer verified-token' } }

describe('server-side administrator authorization', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'verified-user' } }, error: null })
    mocks.maybeSingle.mockResolvedValue({ data: { role: 'administrator' }, error: null })
    mocks.create.mockReturnValue({
      auth: { getUser: mocks.getUser },
      from: () => ({ select: () => ({ eq: (_key, id) => {
        expect(id).toBe('verified-user')
        return { maybeSingle: mocks.maybeSingle }
      } }) }),
    })
  })
  it('rejects absent bearer credentials and legacy shared codes', async () => {
    expect(await validateAdminAccess({ headers: { 'x-admin-access-code': 'old-code' } })).toBe(false)
    expect(mocks.create).not.toHaveBeenCalled()
  })
  it('rejects malformed authorization', async () => {
    expect(await validateAdminAccess({ headers: { authorization: ['Bearer token'] } })).toBe(false)
  })
  it('rejects invalid or expired sessions', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error('expired') })
    expect(await validateAdminAccess(request)).toBe(false)
    expect(mocks.maybeSingle).not.toHaveBeenCalled()
  })
  it.each([null, 'support', 'content_manager', 'partner_manager'])('rejects role %s', async (role) => {
    mocks.maybeSingle.mockResolvedValue({ data: role ? { role } : null })
    expect(await validateAdminAccess(request)).toBe(false)
  })
  it('accepts only a verified user with a database administrator role', async () => {
    expect(await validateAdminAccess(request)).toBe(true)
    expect(mocks.getUser).toHaveBeenCalledWith('verified-token')
  })
  it('fails closed on role lookup errors', async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { role: 'administrator' }, error: new Error('unavailable') })
    expect(await validateAdminAccess(request)).toBe(false)
  })
  it('fails closed when server configuration is missing', async () => {
    mocks.create.mockImplementation(() => { throw new Error('missing config') })
    expect(await validateAdminAccess(request)).toBe(false)
  })
})
