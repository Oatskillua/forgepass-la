import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../../lib/apiFetch'
import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import { saveEvent } from '../../lib/userData'

function EventSaveButton({ userId, event }) {
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  async function save() {
    if (lock.current || saved) return
    lock.current = true
    setBusy(true); setError('')
    try { await saveEvent(userId, event); setSaved(true) }
    catch { setError('Unable to confirm the save. Please retry.') }
    finally { lock.current = false; setBusy(false) }
  }
  return <div>
    <button type="button" disabled={busy || saved} onClick={save} aria-label={(saved ? 'Saved ' : 'Save ') + event.name} className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
      {saved ? 'Saved' : busy ? 'Saving…' : 'Save'}
    </button>
    {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
  </div>
}

export default function LiveEventsSection() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [searchLimitReached, setSearchLimitReached] = useState(false)

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    async function loadEvents() {
      setLoading(true)
      setErrorMessage('')

      try {
        const params = new URLSearchParams({
          city: 'Los Angeles',
          size: '12',
          page: String(page),
        })

        if (searchQuery.trim()) {
          params.set('keyword', searchQuery.trim())
        }

        const response = await apiFetch(`/api/events?${params.toString()}`, { signal: controller.signal })
        const data = await response.json()

        if (!active) return

        if (!response.ok) {
          setErrorMessage(data.error || 'Unable to load events.')
          return
        }

        if (!Array.isArray(data.events)) throw new Error('Unable to load events. Please retry.')
        if (data.page !== undefined && data.page !== page) throw new Error('The event page did not match the request. Please retry.')
        setEvents(data.events)
        setHasMore(data.hasMore === true)
        setSearchLimitReached(data.searchLimitReached === true)
      } catch (error) {
        if (active) {
          setErrorMessage(error.message || 'Unable to load events.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    const timeout = setTimeout(loadEvents, 400)

    return () => {
      active = false
      controller.abort()
      clearTimeout(timeout)
    }
  }, [searchQuery, attempt, page])

  function changePage(next) {
    if (loading || next < 0) return
    setLoading(true); setErrorMessage(''); setPage(next)
  }

  return (
    <section className="mt-16 rounded-3xl border border-white/10 bg-white/5 p-8">
      <h2 className="text-3xl font-bold text-white">
        Live Los Angeles Events
      </h2>

      <p className="mt-4 leading-7 text-white/60">
        Real event listings powered by Ticketmaster Discovery.
      </p>

      <input
        type="search"
        aria-label="Search events"
        maxLength={200}
        value={searchQuery}
        onChange={(event) => { setSearchQuery(event.target.value); setPage(0); setLoading(true); setErrorMessage('') }}
        placeholder="Search events, artists, teams, or venues"
        className="mt-6 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-white outline-none placeholder:text-white/35"
      />

      {loading && (
        <p role="status" className="mt-6 text-white/50">
          Loading events...
        </p>
      )}

      {errorMessage && (
        <div className="mt-6"><p role="alert" className="text-red-300">{errorMessage}</p><button disabled={loading} onClick={() => { setLoading(true); setErrorMessage(''); setAttempt((value) => value + 1) }} className="mt-3 rounded-xl border border-white/15 px-4 py-2 disabled:opacity-40">Retry events</button></div>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button disabled={loading || page === 0} onClick={() => changePage(page - 1)} className="rounded-xl border border-white/15 px-4 py-2 disabled:opacity-40">Previous events</button>
        {!loading && !errorMessage && <span>Page {page + 1}</span>}
        <button disabled={loading || !!errorMessage || !hasMore} onClick={() => changePage(page + 1)} className="rounded-xl border border-white/15 px-4 py-2 disabled:opacity-40">Next events</button>
      </div>
      {!loading && !errorMessage && searchLimitReached && <p className="mt-3 text-sm text-white/60">Search limit reached. Narrow your search to find more events.</p>}

      {!loading && !errorMessage && events.length === 0 && (
        <p className="mt-6 text-white/50">
          No events found.
        </p>
      )}

      {!loading && !errorMessage && events.length > 0 && (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {events.map((event) => (
            <article
              key={event.id}
              className="overflow-hidden rounded-3xl border border-white/10 bg-black/20"
            >
              {event.image && (
                <img
                  src={event.image}
                  alt={event.name}
                  className="h-44 w-full object-cover"
                />
              )}

              <div className="p-5">
                <h3 className="text-lg font-bold text-white">
                  {event.name}
                </h3>

                <p className="mt-3 text-sm text-white/50">
                  {event.venue || 'Venue TBD'}
                </p>

                <p className="mt-2 text-sm text-white/50">
                  {event.date} {event.time}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {event.url && (
                    <a href={event.url} target="_blank" rel="noreferrer" className="inline-flex rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-bold text-black">
                      View Event
                    </a>
                  )}
                  {user ? (
                    <EventSaveButton key={user.id} userId={user.id} event={event} />
                  ) : (
                    <Link to="/auth" className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-bold text-white">Sign in to save</Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
