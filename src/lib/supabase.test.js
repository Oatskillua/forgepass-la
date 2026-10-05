import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const createClient = vi.hoisted(() => vi.fn())
vi.mock('@supabase/supabase-js', () => ({ createClient }))
beforeEach(() => {
  vi.resetModules()
  createClient.mockReset().mockReturnValue({ configured: true })
  vi.stubEnv('VITE_SUPABASE_URL', '')
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
})
afterEach(() => { vi.unstubAllEnvs() })

it('does not create a client or choose a fallback when configuration is absent', async () => {
  const result = await import('./supabase')
  expect(result.supabase).toBeNull()
  expect(result.supabaseConfigurationError).toContain('VITE_SUPABASE_URL')
  expect(createClient).not.toHaveBeenCalled()
})

it.each(['not-a-url', 'javascript:alert(1)', 'https://user:secret@example.com'])('rejects invalid project URL %s', async (url) => {
  vi.stubEnv('VITE_SUPABASE_URL', url)
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'public-test-key')
  const result = await import('./supabase')
  expect(result.supabase).toBeNull()
  expect(createClient).not.toHaveBeenCalled()
})

it('uses only explicitly configured, trimmed project values', async () => {
  vi.stubEnv('VITE_SUPABASE_URL', ' https://example.supabase.co ')
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', ' public-test-key ')
  const result = await import('./supabase')
  expect(createClient).toHaveBeenCalledExactlyOnceWith('https://example.supabase.co', 'public-test-key')
  expect(result.supabase).toEqual({ configured: true })
  expect(result.supabaseConfigurationError).toBe('')
})

it('handles client initialization errors without exposing their contents', async () => {
  vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'public-test-key')
  createClient.mockImplementation(() => { throw new Error('Private failure detail') })
  const result = await import('./supabase')
  expect(result.supabase).toBeNull()
  expect(result.supabaseConfigurationError).not.toContain('Private failure detail')
})
