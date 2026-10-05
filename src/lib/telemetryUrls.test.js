import { expect, it } from 'vitest'
import { sanitizeAnalyticsUrl, sanitizeErrorUrls } from './telemetryUrls'

it('removes sharing and recovery fragments from telemetry URL fields without mutating input', () => {
  const url = 'https://example.com/shared-trip#private-token'
  expect(sanitizeAnalyticsUrl({ type: 'pageview', url })).toEqual({ type: 'pageview', url: 'https://example.com/shared-trip' })
  const event = { request: { url }, breadcrumbs: [{ data: { from: '/auth#access_token=secret', to: url, url } }] }
  expect(JSON.stringify(sanitizeErrorUrls(event))).not.toMatch(/secret|private-token/)
  expect(event.request.url).toBe(url)
  expect(sanitizeErrorUrls({ message: 'Error' })).toEqual({ message: 'Error' })
})
