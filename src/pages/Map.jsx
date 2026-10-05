import { useMemo, useState } from 'react'
import { ExternalLink, MapPinned, Plus, Trash2 } from 'lucide-react'

import PageShell from '../components/PageShell'
import { buildDirectionsUrl, buildRideshareUrl, MAX_ROUTE_STOPS } from '../lib/navigation'

export default function MapPage() {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [mode, setMode] = useState('driving')
  const [waypoints, setWaypoints] = useState([])
  const [draftStop, setDraftStop] = useState('')

  const directions = useMemo(() => {
    if (!destination.trim()) return { url: '', error: '' }
    try { return { url: buildDirectionsUrl({ origin, destination, mode, waypoints }), error: '' } }
    catch (failure) { return { url: '', error: failure.message } }
  }, [destination, mode, origin, waypoints])
  const directionsUrl = directions.url
  const rideshareUrl = useMemo(() => destination.trim() ? buildRideshareUrl(destination) : '', [destination])

  const addStop = () => {
    if (!draftStop.trim() || waypoints.length >= MAX_ROUTE_STOPS) return
    setWaypoints((current) => current.length < MAX_ROUTE_STOPS ? [...current, draftStop.trim()] : current)
    setDraftStop('')
  }

  return (
    <PageShell eyebrow="Smart Navigation" title="Plan a route" subtitle="Build a multi-stop Los Angeles route and launch it in a live navigation provider.">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-7">
          <div className="grid gap-5">
            <label className="text-sm font-semibold text-white/75">Starting point<input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="Current location or address" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-white outline-none focus:border-cyan-300" /></label>
            <label className="text-sm font-semibold text-white/75">Destination<input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Venue, attraction, or address" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-white outline-none focus:border-cyan-300" /></label>
            <label className="text-sm font-semibold text-white/75">Travel mode<select value={mode} onChange={(event) => setMode(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#101827] px-4 py-4 text-white"><option value="driving">Driving</option><option value="walking">Walking</option><option value="transit">Transit</option><option value="bicycling">Bicycling</option></select></label>
            <div><label className="text-sm font-semibold text-white/75" htmlFor="route-stop">Optional stop</label><div className="mt-2 flex gap-2"><input id="route-stop" value={draftStop} onChange={(event) => setDraftStop(event.target.value)} placeholder="Add a stop" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" /><button type="button" disabled={waypoints.length >= MAX_ROUTE_STOPS || !draftStop.trim()} onClick={addStop} className="rounded-2xl border border-cyan-300/30 px-4 text-cyan-200" aria-label="Add stop"><Plus /></button></div></div>
          </div>
          <p className="mt-4 text-sm text-white/60">Up to three optional stops per route. Confirm all stops in Google Maps before starting.</p>
          {waypoints.length >= MAX_ROUTE_STOPS && <p role="status" className="mt-2 text-sm text-white/60">Stop limit reached. Remove a stop to add another.</p>}
          {directions.error && <p role="alert" className="mt-3 text-red-300">{directions.error}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={directionsUrl || undefined} target="_blank" rel="noreferrer" aria-disabled={!directionsUrl} className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-bold ${directionsUrl ? 'bg-cyan-300 text-black' : 'pointer-events-none bg-white/10 text-white/30'}`}>Launch directions <ExternalLink className="h-4 w-4" /></a>
            <a href={rideshareUrl || undefined} aria-disabled={!rideshareUrl} className={`rounded-2xl border border-white/15 px-5 py-3 font-bold ${rideshareUrl ? 'text-white' : 'pointer-events-none text-white/30'}`}>Rideshare handoff</a>
          </div>
          <p className="mt-3 text-sm text-white/60">Rideshare handoff uses your current location and final destination only. Add any intermediate stops in the rideshare app.</p>
        </section>
        <section className="rounded-3xl border border-white/10 bg-black/20 p-7">
          <MapPinned className="h-8 w-8 text-cyan-300" />
          <h2 className="mt-4 text-2xl font-bold">Route summary</h2>
          <ol className="mt-5 space-y-3 text-sm">
            <li className="rounded-xl bg-white/5 p-3"><span className="text-white/40">Start:</span> {origin || 'Current location'}</li>
            {waypoints.map((stop, index) => <li key={`${stop}-${index}`} className="flex items-center justify-between rounded-xl bg-white/5 p-3"><span><span className="text-white/40">Stop {index + 1}:</span> {stop}</span><button type="button" onClick={() => setWaypoints((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${stop}`}><Trash2 className="h-4 w-4 text-red-200" /></button></li>)}
            <li className="rounded-xl bg-white/5 p-3"><span className="text-white/40">Destination:</span> {destination || 'Not selected'}</li>
          </ol>
          <p className="mt-5 text-xs leading-5 text-white/40">Travel times and route conditions are shown by the external navigation provider. ForgePass does not label estimates as live without provider data.</p>
        </section>
      </div>
    </PageShell>
  )
}
