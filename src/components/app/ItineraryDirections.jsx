import { useState } from 'react'
import { buildDirectionsUrl, MAX_ROUTE_STOPS } from '../../lib/navigation'

function initialDestination(stop) {
  const snapshot = stop.location_snapshot || {}
  if (stop.item_type === 'event' && typeof snapshot.venue === 'string' && snapshot.venue.trim()) {
    return [snapshot.venue.trim(), typeof snapshot.city === 'string' ? snapshot.city.trim() : ''].filter(Boolean).join(', ')
  }
  return stop.title || ''
}

export default function ItineraryDirections({ stops }) {
  const [open, setOpen] = useState(false)
  const [destinations, setDestinations] = useState(() => stops.map(initialDestination))
  const [origin, setOrigin] = useState('')
  const [mode, setMode] = useState('driving')
  const routes = []
  let error = ''
  if (open) {
    try {
      if (destinations.some((destination) => !destination.trim())) throw new Error('Enter a destination for every stop.')
      for (let index = 0; index < destinations.length; index += MAX_ROUTE_STOPS + 1) {
        const group = destinations.slice(index, index + MAX_ROUTE_STOPS + 1)
        routes.push({
          first: index + 1, last: index + group.length,
          url: buildDirectionsUrl({ origin: index ? destinations[index - 1] : origin, destination: group.at(-1), waypoints: group.slice(0, -1), mode }),
        })
      }
    } catch (failure) { error = failure.message }
  }
  const fieldClass = 'mt-2 w-full rounded-xl border border-white/15 bg-[#101827] p-3'
  return <div className="my-4">
    <button type="button" disabled={!stops.length} aria-expanded={open} onClick={() => setOpen(!open)} className="rounded-xl border border-cyan-300/40 px-4 py-3 text-sm text-cyan-200 disabled:opacity-40">{open ? 'Close directions' : 'Plan trip directions'}</button>
    {open && <div className="mt-3 space-y-3 rounded-xl bg-black/20 p-4">
      <p className="text-sm text-white/70">Confirm each venue or address before opening Google Maps. Changes here only affect directions; your saved stops stay the same.</p>
      <label className="block">Route starting point<input className={fieldClass} placeholder="Current location" value={origin} onChange={(event) => setOrigin(event.target.value)} /></label>
      <label className="block">Trip travel mode<select className={fieldClass} value={mode} onChange={(event) => setMode(event.target.value)}><option value="driving">Driving</option><option value="walking">Walking</option><option value="transit">Transit</option><option value="bicycling">Bicycling</option></select></label>
      {destinations.map((destination, index) => <label className="block" key={stops[index].id}>Destination {index + 1}: {stops[index].title}<input className={fieldClass} value={destination} onChange={(event) => setDestinations((current) => current.map((value, position) => position === index ? event.target.value : value))} /></label>)}
      {error ? <p role="alert" className="text-red-300">{error}</p> : <div className="flex flex-wrap gap-3">{routes.map((route, index) => <a key={index} href={route.url} target="_blank" rel="noreferrer" className="rounded-xl border border-cyan-300/40 px-4 py-3 text-sm text-cyan-200">Open route {index + 1} (stops {route.first}–{route.last})</a>)}</div>}
      <p className="text-sm text-white/60">Routes include up to four destinations each. Open numbered routes in order; each later route starts at the previous route’s final stop. Confirm the route and supported travel mode in Google Maps.</p>
    </div>}
  </div>
}
