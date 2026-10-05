import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import PageShell from '../components/PageShell'
import { getSharedItinerary } from '../lib/itinerarySharing'
import { displaySchedule } from '../lib/stopSchedule'

export default function SharedItinerary() {
  const { hash } = useLocation()
  return <SharedTrip key={hash} token={hash.slice(1)} />
}

function SharedTrip({ token }) {
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    getSharedItinerary(token).then((data) => { if (active) setTrip(data) })
      .catch(() => { if (active) setError('Unable to load this itinerary. Try again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [token, attempt])
  function refresh() { setTrip(null); setError(''); setLoading(true); setAttempt((value) => value + 1) }
  return <PageShell eyebrow="Shared itinerary" title={trip?.name || 'Shared trip'} subtitle="Read-only trip details shared by the owner.">
    <button disabled={loading} onClick={refresh} className="rounded-xl border border-cyan-300/40 px-4 py-3 text-cyan-200">Refresh shared trip</button>
    {loading && <p role="status">Loading shared itinerary…</p>}
    {error && <p role="alert">{error}</p>}
    {!loading && !error && !trip && <p>This link is unavailable. It may have been turned off or replaced.</p>}
    {trip && <section className="mt-5 space-y-4">
      <p>{trip.starts_on || 'Start date not set'} — {trip.ends_on || 'End date not set'}</p>
      <ol className="space-y-3">{trip.stops.map((stop, index) => <li key={index} className="rounded-xl bg-white/5 p-4">
        <h2>{index + 1}. {stop.title}</h2><p>{stop.starts_at ? displaySchedule(stop.starts_at) : 'Time not scheduled'}</p>
      </li>)}</ol>
      {!trip.stops.length && <p>No stops added yet.</p>}
      <p className="text-sm text-white/60">Times use your device time zone. Refresh to check for changes. Visit times do not confirm reservations.</p>
    </section>}
  </PageShell>
}
