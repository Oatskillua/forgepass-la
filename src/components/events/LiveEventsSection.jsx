import { useEffect, useState } from 'react'

export default function LiveEventsSection() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true

    async function loadEvents() {
      try {
        const response = await fetch('/api/events')
        const data = await response.json()

        if (!active) return

        if (!response.ok) {
          setErrorMessage(data.error || 'Unable to load events.')
          return
        }

        setEvents(data.events || [])
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

    loadEvents()

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="mt-16 rounded-3xl border border-white/10 bg-white/5 p-8">
      <h2 className="text-3xl font-bold text-white">
        Live Los Angeles Events
      </h2>

      <p className="mt-4 leading-7 text-white/60">
        Real event listings powered by Ticketmaster Discovery.
      </p>

      {loading && (
        <p className="mt-6 text-white/50">
          Loading events...
        </p>
      )}

      {errorMessage && (
        <p className="mt-6 text-red-300">
          {errorMessage}
        </p>
      )}

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

                {event.url && (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-bold text-black"
                  >
                    View Event
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}