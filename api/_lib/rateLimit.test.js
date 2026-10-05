import { expect, it } from 'vitest'
import { createRateLimiter, getClientIp } from './rateLimit.js'

it('enforces per-key windows and resets exactly at expiration', () => {
  let now = 0
  const check = createRateLimiter({ clock: () => now })
  expect(check({ key: 'a', limit: 1, windowMs: 1000 })).toMatchObject({ allowed: true, remaining: 0 })
  expect(check({ key: 'a', limit: 1 })).toMatchObject({ allowed: false, resetAt: 1000 })
  expect(check({ key: 'b' }).allowed).toBe(true)
  now = 1000
  expect(check({ key: 'a', limit: 1 }).allowed).toBe(true)
})
it('refuses new keys at capacity without forgetting existing quotas and reclaims expired records', () => {
  let now = 0
  const check = createRateLimiter({ maxBuckets: 2, clock: () => now })
  check({ key: 'a', limit: 1, windowMs: 1000 })
  check({ key: 'b', limit: 1, windowMs: 1000 })
  for (let i = 0; i < 20; i++) expect(check({ key: `new-${i}` }).allowed).toBe(false)
  expect(check({ key: 'a', limit: 1 }).allowed).toBe(false)
  now = 1000
  expect(check({ key: 'c' }).allowed).toBe(true)
  expect(check({ key: 'd' }).allowed).toBe(true)
  expect(check({ key: 'e' }).allowed).toBe(false)
})
it('handles absent, malformed and oversized forwarded headers', () => {
  expect(getClientIp({})).toBe('unknown')
  expect(getClientIp({ headers: { 'x-forwarded-for': ['a'], 'x-real-ip': {} } })).toBe('unknown')
  expect(getClientIp({ headers: { 'x-forwarded-for': 'a'.repeat(1000) } })).toBe('unknown')
  expect(getClientIp({ headers: { 'x-forwarded-for': ' 192.0.2.1, 192.0.2.2' } })).toBe('192.0.2.1')
})
