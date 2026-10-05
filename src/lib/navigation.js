const travelModes = new Set(['driving', 'walking', 'transit', 'bicycling'])
// Conservative limit compatible with Google Maps mobile browser links.
export const MAX_ROUTE_STOPS = 3

export function normalizeTravelMode(mode) {
  return travelModes.has(mode) ? mode : 'driving'
}

export function buildDirectionsUrl({ destination, origin = '', mode = 'driving', waypoints = [] }) {
  if (!destination?.trim()) throw new Error('A destination is required.')

  const params = new URLSearchParams({
    api: '1',
    destination: destination.trim(),
    travelmode: normalizeTravelMode(mode),
  })

  if (origin.trim()) params.set('origin', origin.trim())
  const validWaypoints = waypoints.map((item) => item.trim()).filter(Boolean)
  if (validWaypoints.length > MAX_ROUTE_STOPS) throw new Error('Use up to three optional stops per route.')
  if (validWaypoints.some((item) => item.includes('|'))) throw new Error('Remove the | character from stop names.')
  if (validWaypoints.length) params.set('waypoints', validWaypoints.join('|'))

  const url = `https://www.google.com/maps/dir/?${params.toString()}`
  if (url.length > 2048) throw new Error('This route is too long to share. Shorten the addresses or remove a stop.')
  return url
}

export function buildRideshareUrl(destination) {
  if (!destination?.trim()) throw new Error('A destination is required.')
  const params = new URLSearchParams({
    action: 'setPickup',
    pickup: 'my_location',
    'dropoff[formatted_address]': destination.trim(),
  })
  return `https://m.uber.com/ul/?${params.toString()}`
}
