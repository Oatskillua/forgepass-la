import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, MapPinned, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import PageShell from '../components/PageShell'
import { useAuth } from '../auth/AuthContext'
import { getSavedContent } from '../lib/userData'
import {
  buildDirectionsUrl,
  buildRideshareUrl,
  MAX_ROUTE_STOPS,
} from '../lib/navigation'

function buildSavedChoices(content) {
  const places = content.favorites.map((place) => {
    const snapshot = place.place_snapshot || {}

    const address =
      typeof snapshot.address === 'string'
        ? snapshot.address.trim()
        : ''

    const city =
      typeof snapshot.city === 'string'
        ? snapshot.city.trim()
        : ''

    const title =
      typeof snapshot.title === 'string'
        ? snapshot.title.trim()
        : ''

    return {
      key: `place:${place.id}`,
      label: `${place.place_name} (place)`,
      routeValue: address
        ? [address, city].filter(Boolean).join(', ')
        : title || place.place_name,
    }
  })

  const events = content.events.map((event) => {
    const snapshot = event.event_snapshot || {}

    const venue =
      typeof snapshot.venue === 'string'
        ? snapshot.venue.trim()
        : ''

    const city =
      typeof snapshot.city === 'string'
        ? snapshot.city.trim()
        : ''

    return {
      key: `event:${event.id}`,
      label: `${event.event_name} (event)`,
      routeValue: venue
        ? [venue, city].filter(Boolean).join(', ')
        : event.event_name,
    }
  })

  return [...places, ...events]
}

const emptySavedContent = {
  favorites: [],
  events: [],
}

export default function MapPage() {
  const { user } = useAuth()

  const userId = user?.id || ''

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [mode, setMode] = useState('driving')
  const [waypoints, setWaypoints] = useState([])
  const [draftStop, setDraftStop] = useState('')

  const [savedSelection, setSavedSelection] = useState('')
  const [savedAttempt, setSavedAttempt] = useState(0)

  const [savedResult, setSavedResult] = useState({
    requestKey: '',
    content: emptySavedContent,
    error: '',
  })

  const savedRequestKey = userId
    ? `${userId}:${savedAttempt}`
    : ''

  useEffect(() => {
    if (!userId) return undefined

    let active = true

    const requestKey = `${userId}:${savedAttempt}`

    getSavedContent(userId)
      .then((content) => {
        if (!active) return

        setSavedResult({
          requestKey,
          content,
          error: '',
        })
      })
      .catch(() => {
        if (!active) return

        setSavedResult({
          requestKey,
          content: emptySavedContent,
          error:
            'Unable to load saved places and events. Try again.',
        })
      })

    return () => {
      active = false
    }
  }, [userId, savedAttempt])

  const savedLoading =
    !!userId &&
    savedResult.requestKey !== savedRequestKey

  const savedError =
    savedResult.requestKey === savedRequestKey
      ? savedResult.error
      : ''

  const savedChoices = useMemo(() => {
    if (
      !userId ||
      savedResult.requestKey !== savedRequestKey ||
      savedResult.error
    ) {
      return []
    }

    return buildSavedChoices(savedResult.content)
  }, [
    savedRequestKey,
    savedResult,
    userId,
  ])

  const effectiveSavedSelection = savedChoices.some(
    (choice) => choice.key === savedSelection,
  )
    ? savedSelection
    : ''

  const selectedSaved =
    savedChoices.find(
      (choice) =>
        choice.key === effectiveSavedSelection,
    ) || null

  const directions = useMemo(() => {
    if (!destination.trim()) {
      return {
        url: '',
        error: '',
      }
    }

    try {
      return {
        url: buildDirectionsUrl({
          origin,
          destination,
          mode,
          waypoints,
        }),
        error: '',
      }
    } catch (failure) {
      return {
        url: '',
        error: failure.message,
      }
    }
  }, [
    destination,
    mode,
    origin,
    waypoints,
  ])

  const directionsUrl = directions.url

  const rideshareUrl = useMemo(
    () =>
      destination.trim()
        ? buildRideshareUrl(destination)
        : '',
    [destination],
  )

  const addStop = () => {
    if (
      !draftStop.trim() ||
      waypoints.length >= MAX_ROUTE_STOPS
    ) {
      return
    }

    setWaypoints((current) =>
      current.length < MAX_ROUTE_STOPS
        ? [...current, draftStop.trim()]
        : current,
    )

    setDraftStop('')
  }

  const addSavedStop = () => {
    if (
      !selectedSaved ||
      waypoints.length >= MAX_ROUTE_STOPS
    ) {
      return
    }

    setWaypoints((current) =>
      current.length < MAX_ROUTE_STOPS
        ? [...current, selectedSaved.routeValue]
        : current,
    )
  }

  return (
    <PageShell
      eyebrow="Smart Navigation"
      title="Plan a route"
      subtitle="Build a multi-stop Los Angeles route and launch it in a live navigation provider."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-7">
          <div className="grid gap-5">
            <label className="text-sm font-semibold text-white/75">
              Starting point

              <input
                value={origin}
                onChange={(event) =>
                  setOrigin(event.target.value)
                }
                placeholder="Current location or address"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-white outline-none focus:border-cyan-300"
              />
            </label>

            <label className="text-sm font-semibold text-white/75">
              Destination

              <input
                value={destination}
                onChange={(event) =>
                  setDestination(event.target.value)
                }
                placeholder="Venue, attraction, or address"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-white outline-none focus:border-cyan-300"
              />
            </label>

            {userId ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <label
                  className="block text-sm font-semibold text-white/75"
                  htmlFor="saved-route-item"
                >
                  Saved place or event
                </label>

                <select
                  id="saved-route-item"
                  value={effectiveSavedSelection}
                  disabled={
                    savedLoading ||
                    !!savedError ||
                    !savedChoices.length
                  }
                  onChange={(event) =>
                    setSavedSelection(
                      event.target.value,
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#101827] px-4 py-4 text-white"
                >
                  <option value="">
                    {savedLoading
                      ? 'Loading saved content…'
                      : 'Choose saved content'}
                  </option>

                  {savedChoices.map((choice) => (
                    <option
                      key={choice.key}
                      value={choice.key}
                    >
                      {choice.label}
                    </option>
                  ))}
                </select>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!selectedSaved}
                    onClick={() =>
                      setDestination(
                        selectedSaved.routeValue,
                      )
                    }
                    className="rounded-xl border border-cyan-300/30 px-4 py-3 text-sm font-bold text-cyan-200 disabled:opacity-40"
                  >
                    Use as destination
                  </button>

                  <button
                    type="button"
                    disabled={
                      !selectedSaved ||
                      waypoints.length >=
                        MAX_ROUTE_STOPS
                    }
                    onClick={addSavedStop}
                    className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white/80 disabled:opacity-40"
                  >
                    Add saved stop
                  </button>
                </div>

                {savedError && (
                  <div className="mt-3">
                    <p
                      role="alert"
                      className="text-sm text-red-300"
                    >
                      {savedError}
                    </p>

                    <button
                      type="button"
                      disabled={savedLoading}
                      onClick={() =>
                        setSavedAttempt(
                          (value) => value + 1,
                        )
                      }
                      className="mt-2 rounded-xl border border-white/15 px-3 py-2 text-sm"
                    >
                      Retry saved content
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-white/60">
                <Link
                  to="/auth"
                  className="font-bold text-cyan-200"
                >
                  Sign in
                </Link>{' '}
                to use saved places and events in routes.
              </p>
            )}

            <label className="text-sm font-semibold text-white/75">
              Travel mode

              <select
                value={mode}
                onChange={(event) =>
                  setMode(event.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#101827] px-4 py-4 text-white"
              >
                <option value="driving">
                  Driving
                </option>
                <option value="walking">
                  Walking
                </option>
                <option value="transit">
                  Transit
                </option>
                <option value="bicycling">
                  Bicycling
                </option>
              </select>
            </label>

            <div>
              <label
                className="text-sm font-semibold text-white/75"
                htmlFor="route-stop"
              >
                Optional stop
              </label>

              <div className="mt-2 flex gap-2">
                <input
                  id="route-stop"
                  value={draftStop}
                  onChange={(event) =>
                    setDraftStop(
                      event.target.value,
                    )
                  }
                  placeholder="Add a stop"
                  className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
                />

                <button
                  type="button"
                  disabled={
                    waypoints.length >=
                      MAX_ROUTE_STOPS ||
                    !draftStop.trim()
                  }
                  onClick={addStop}
                  className="rounded-2xl border border-cyan-300/30 px-4 text-cyan-200"
                  aria-label="Add stop"
                >
                  <Plus />
                </button>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-white/60">
            Up to three optional stops per route.
            Confirm all stops in Google Maps before
            starting.
          </p>

          {waypoints.length >=
            MAX_ROUTE_STOPS && (
            <p
              role="status"
              className="mt-2 text-sm font-semibold text-amber-200"
            >
              Stop limit reached. Remove a stop to
              add another.
            </p>
          )}

          {directions.error && (
            <p
              role="alert"
              className="mt-3 text-red-300"
            >
              {directions.error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={
                directionsUrl || undefined
              }
              target="_blank"
              rel="noreferrer"
              aria-disabled={!directionsUrl}
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-bold ${
                directionsUrl
                  ? 'bg-cyan-300 text-black'
                  : 'pointer-events-none bg-white/10 text-white/30'
              }`}
            >
              Launch directions

              <ExternalLink className="h-4 w-4" />
            </a>

            <a
              href={
                rideshareUrl || undefined
              }
              target="_blank"
              rel="noreferrer"
              aria-disabled={!rideshareUrl}
              className={`rounded-2xl border border-white/15 px-5 py-3 font-bold ${
                rideshareUrl
                  ? 'text-white'
                  : 'pointer-events-none text-white/30'
              }`}
            >
              Rideshare handoff
            </a>
          </div>

          <p className="mt-3 text-sm text-white/60">
            Rideshare handoff uses your current
            location and final destination only.
            Add any intermediate stops in the
            rideshare app.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-7">
          <MapPinned className="h-8 w-8 text-cyan-300" />

          <h2 className="mt-4 text-2xl font-bold">
            Route summary
          </h2>

          <ol className="mt-5 space-y-3 text-sm">
            <li className="rounded-xl bg-white/5 p-3">
              <span className="text-white/40">
                Start:
              </span>{' '}
              {origin || 'Current location'}
            </li>

            {waypoints.map(
              (stop, index) => (
                <li
                  key={`${stop}-${index}`}
                  className="flex items-center justify-between rounded-xl bg-white/5 p-3"
                >
                  <span>
                    <span className="text-white/40">
                      Stop {index + 1}:
                    </span>{' '}
                    {stop}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setWaypoints(
                        (current) =>
                          current.filter(
                            (
                              _,
                              itemIndex,
                            ) =>
                              itemIndex !==
                              index,
                          ),
                      )
                    }
                    aria-label={`Remove ${stop}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-200" />
                  </button>
                </li>
              ),
            )}

            <li className="rounded-xl bg-white/5 p-3">
              <span className="text-white/40">
                Destination:
              </span>{' '}
              {destination ||
                'Not selected'}
            </li>
          </ol>

          <p className="mt-5 text-xs leading-5 text-white/40">
            Travel times and route conditions are
            shown by the external navigation
            provider. ForgePass does not label
            estimates as live without provider
            data.
          </p>
        </section>
      </div>
    </PageShell>
  )
}