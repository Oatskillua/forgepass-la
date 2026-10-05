import { describe, expect, it } from 'vitest'

import { buildDirectionsUrl, buildRideshareUrl, normalizeTravelMode } from './navigation'

describe('navigation provider links', () => {
  it('rejects excess stops rather than dropping them', () => {
    expect(() => buildDirectionsUrl({ destination: 'LA', waypoints: ['A', 'B', 'C', 'D'] })).toThrow('three optional stops')
  })
  it('rejects encoded URLs over the provider limit', () => {
    expect(() => buildDirectionsUrl({ destination: '博'.repeat(250) })).toThrow('too long')
  })
  it('rejects a stop containing the provider waypoint separator', () => {
    expect(() => buildDirectionsUrl({ destination: 'LA', waypoints: ['A|B'] })).toThrow('Remove the | character')
  })
  it('builds encoded multi-stop directions', () => {
    const url = new URL(buildDirectionsUrl({
      origin: 'LAX',
      destination: 'Santa Monica Pier',
      mode: 'transit',
      waypoints: ['The Getty Center', 'Hollywood Bowl'],
    }))

    expect(url.hostname).toBe('www.google.com')
    expect(url.searchParams.get('destination')).toBe('Santa Monica Pier')
    expect(url.searchParams.get('travelmode')).toBe('transit')
    expect(url.searchParams.get('waypoints')).toBe('The Getty Center|Hollywood Bowl')
  })

  it('falls back to driving for unsupported modes', () => {
    expect(normalizeTravelMode('spaceship')).toBe('driving')
  })

  it('requires a destination', () => {
    expect(() => buildDirectionsUrl({ destination: '' })).toThrow('A destination is required.')
  })

  it('builds an encoded rideshare handoff', () => {
    expect(new URL(buildRideshareUrl('Griffith Observatory')).searchParams.get('dropoff[formatted_address]')).toBe('Griffith Observatory')
  })
})
