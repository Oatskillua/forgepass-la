// @vitest-environment node
import { expect, it } from 'vitest'
import { validateMobileConfig } from './mobileConfig.js'

const valid = { VITE_SUPABASE_URL: 'https://database.example', VITE_SUPABASE_ANON_KEY: 'public-client-key', VITE_PUBLIC_SITE_URL: 'https://website.example', VITE_API_ORIGIN: 'https://api.example' }
it('accepts distinct configured service origins without claiming connectivity', () => {
  expect(validateMobileConfig(valid)).toEqual([])
})
it('reports all missing settings together without revealing supplied values', () => {
  expect(validateMobileConfig({})).toHaveLength(4)
  const errors = validateMobileConfig({ ...valid, VITE_API_ORIGIN: 'https://private:secret@api.example' })
  expect(errors).toHaveLength(1)
  expect(errors[0]).toContain('VITE_API_ORIGIN')
  expect(errors[0]).not.toContain('secret')
})
it.each(['http://api.example', 'https://localhost', 'https://127.0.0.1', 'https://[::1]', 'https://api.example/path', 'https://api.example?key=secret', 'https://api.example#secret', 'invalid'])('rejects invalid mobile service origin %s', (origin) => {
  expect(validateMobileConfig({ ...valid, VITE_API_ORIGIN: origin })).toHaveLength(1)
})
