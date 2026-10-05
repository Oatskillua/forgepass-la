import { expect, it } from 'vitest'
import { getPublicWebOrigin } from './publicWebOrigin'

it('uses the canonical website for native and preview builds', () => {
  for (const native of [true, false]) {
    expect(getPublicWebOrigin({ configured: ' https://forgepass.example/ ', native, browserOrigin: 'https://localhost' })).toBe('https://forgepass.example')
  }
})

it('permits the current web origin only for browser builds', () => {
  expect(getPublicWebOrigin({ configured: '', native: false, browserOrigin: 'http://localhost:5173' })).toBe('http://localhost:5173')
  expect(() => getPublicWebOrigin({ configured: '', native: true, browserOrigin: 'https://localhost' })).toThrow('Website links are unavailable')
})

it.each(['http://forgepass.example', 'https://localhost', 'https://127.0.0.1', 'https://[::1]', 'https://user:password@forgepass.example', 'https://forgepass.example/path', 'https://forgepass.example?redirect=other', 'https://forgepass.example#token', 'javascript:alert(1)', 'invalid'])('rejects invalid configured website origin %s without fallback', (configured) => {
  expect(() => getPublicWebOrigin({ configured, native: false, browserOrigin: 'https://fallback.example' })).toThrow('Website links are unavailable')
})
