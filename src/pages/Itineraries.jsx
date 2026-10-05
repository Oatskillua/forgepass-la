import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import AppNav from '../components/app/AppNav'
import ItineraryDirections from '../components/app/ItineraryDirections'
import { displaySchedule, localScheduleValue, scheduleTimestamp } from '../lib/stopSchedule'
import { updateStopSchedule } from '../lib/userData'
import { downloadItineraryCalendar } from '../lib/itineraryCalendar'
import { setItinerarySharing } from '../lib/itinerarySharing'
import { getPublicWebOrigin } from '../lib/publicWebOrigin'
import PageShell from '../components/PageShell'
import { addItineraryItem, createItinerary, deleteItinerary, duplicateItinerary, getItineraries, getSavedContent, removeItineraryItem, reorderItineraryStops, updateItinerary, updateStopNotes } from '../lib/userData'

const inputClass = 'mt-2 w-full rounded-xl border border-white/15 bg-[#101827] p-3'
const buttonClass = 'rounded-xl border border-cyan-300/40 px-4 py-3 text-sm text-cyan-200 disabled:opacity-40'

export default function Itineraries() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [saved, setSaved] = useState({ favorites: [], events: [] })
  const [name, setName] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [drafts, setDrafts] = useState({})
  const [selections, setSelections] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [savedLoading, setSavedLoading] = useState(true)
  const [savedError, setSavedError] = useState('')
  const [savedAttempt, setSavedAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [editing, setEditing] = useState(null)
  const [noteDraft, setNoteDraft] = useState(null)
  const [scheduleDraft, setScheduleDraft] = useState(null)
  const operationLock = useRef(false)
  let sharingOrigin = ''
  try { sharingOrigin = getPublicWebOrigin() } catch { /* Sharing can still be revoked without a website origin. */ }

  useEffect(() => {
    let active = true
    getItineraries(user.id)
      .then((trips) => { if (active) setItems(trips) })
      .catch(() => { if (active) setLoadError('Unable to load itineraries. Try again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user.id, loadAttempt])

  useEffect(() => {
    let active = true
    getSavedContent(user.id)
      .then((content) => { if (active) setSaved(content) })
      .catch(() => { if (active) setSavedError('Unable to load saved places and events. Try again.') })
      .finally(() => { if (active) setSavedLoading(false) })
    return () => { active = false }
  }, [user.id, savedAttempt])

  const choices = [
    ...saved.favorites.map((place) => ({ key: 'place:' + place.id, title: place.place_name, item_type: 'place', external_id: place.place_external_id, snapshot: place.place_snapshot })),
    ...saved.events.map((event) => ({ key: 'event:' + event.id, title: event.event_name, item_type: 'event', external_id: event.event_external_id, snapshot: event.event_snapshot })),
  ]

  async function perform(operation) {
    if (operationLock.current) return
    operationLock.current = true
    setBusy(true)
    setError('')
    try { await operation() } catch (failure) { setError(failure.message || 'Unable to save changes.') }
    finally { operationLock.current = false; setBusy(false) }
  }

  function create(event) {
    event.preventDefault()
    if (loading || loadError) return
    if (!name.trim()) return
    if (start && end && end < start) { setError('End date must be on or after the start date.'); return }
    perform(async () => {
      const trip = await createItinerary(user.id, { name: name.trim(), starts_on: start || null, ends_on: end || null })
      setItems((current) => [trip, ...current])
      setName(''); setStart(''); setEnd('')
    })
  }

  function addStop(trip, source) {
    const title = source?.title || drafts[trip.id]?.trim()
    if (!title) return
    perform(async () => {
      const position = Math.max(-1, ...trip.itinerary_items.map((stop) => stop.position)) + 1
      const stop = await addItineraryItem(trip.id, title, position, source)
      setItems((current) => current.map((entry) => entry.id === trip.id ? { ...entry, itinerary_items: [...entry.itinerary_items, stop] } : entry))
      setDrafts((current) => ({ ...current, [trip.id]: '' }))
      setSelections((current) => ({ ...current, [trip.id]: '' }))
    })
  }

  function removeStop(tripId, stopId) {
    perform(async () => {
      await removeItineraryItem(stopId)
      setItems((current) => current.map((trip) => trip.id === tripId ? { ...trip, itinerary_items: trip.itinerary_items.filter((stop) => stop.id !== stopId) } : trip))
    })
  }

  function moveStop(trip, index, delta) {
    const destination = index + delta
    if (destination < 0 || destination >= trip.itinerary_items.length) return
    const reordered = [...trip.itinerary_items]
    ;[reordered[index], reordered[destination]] = [reordered[destination], reordered[index]]
    perform(async () => {
      await reorderItineraryStops(trip.id, trip.itinerary_items.map((stop) => stop.id), reordered.map((stop) => stop.id))
      setItems((current) => current.map((entry) => entry.id === trip.id
        ? { ...entry, itinerary_items: reordered.map((stop, position) => ({ ...stop, position })) }
        : entry))
    })
  }

  function removeTrip(id) {
    perform(async () => {
      await deleteItinerary(id)
      setItems((current) => current.filter((trip) => trip.id !== id))
      setConfirmDelete(null)
    })
  }

  function duplicateTrip(id) {
    perform(async () => {
      const copy = await duplicateItinerary(id)
      setItems((current) => [copy, ...current])
    })
  }

  function refreshTrips() {
    if (loading || editing || noteDraft || scheduleDraft) return
    perform(async () => {
      const trips = await getItineraries(user.id)
      setItems(trips)
      setLoadError('')
      setConfirmDelete(null)
    })
  }

  function saveDetails(event) {
    event.preventDefault()
    if (!editing.name.trim()) { setError('Enter an itinerary name.'); return }
    if (editing.start && editing.end && editing.end < editing.start) {
      setError('End date must be on or after the start date.'); return
    }
    perform(async () => {
      const updated = await updateItinerary(editing.original, {
        name: editing.name.trim(), starts_on: editing.start || null, ends_on: editing.end || null,
      })
      setItems((current) => current.map((trip) => trip.id === updated.id
        ? { ...trip, ...updated, itinerary_items: trip.itinerary_items } : trip))
      setEditing(null)
    })
  }

  function saveNotes(event) {
    event.preventDefault()
    perform(async () => {
      const updated = await updateStopNotes(noteDraft.tripId, noteDraft.original, noteDraft.text)
      setItems((current) => current.map((trip) => trip.id === noteDraft.tripId
        ? { ...trip, itinerary_items: trip.itinerary_items.map((stop) => stop.id === updated.id ? { ...stop, notes: updated.notes } : stop) }
        : trip))
      setNoteDraft(null)
    })
  }

  function saveSchedule(event) {
    event.preventDefault()
    perform(async () => {
      const updated = await updateStopSchedule(scheduleDraft.tripId, scheduleDraft.original, scheduleTimestamp(scheduleDraft.value))
      setItems((current) => current.map((trip) => trip.id === scheduleDraft.tripId
        ? { ...trip, itinerary_items: trip.itinerary_items.map((stop) => stop.id === updated.id ? { ...stop, starts_at: updated.starts_at } : stop) }
        : trip))
      setScheduleDraft(null)
    })
  }

  function changeSharing(trip, enabled) {
    perform(async () => {
      if (enabled) getPublicWebOrigin()
      const updated = await setItinerarySharing(trip, enabled)
      setItems((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated } : item))
    })
  }

  return (
    <PageShell eyebrow="Trip planning" title="Itineraries" subtitle="Create dated trips with saved places, events, and custom stops.">
      <AppNav />
      <button disabled={busy || loading || !!editing || !!noteDraft || !!scheduleDraft} onClick={refreshTrips} className={buttonClass}>Refresh itineraries</button>
      {(editing || noteDraft || scheduleDraft) && <p className="my-3 text-sm text-white/60">Save or cancel the open editor before refreshing itineraries.</p>}
      <form onSubmit={create} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
        <label className="block">Itinerary name<input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className={inputClass} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>Start date<input type="date" value={start} onChange={(event) => setStart(event.target.value)} className={inputClass} /></label>
          <label>End date<input type="date" value={end} onChange={(event) => setEnd(event.target.value)} className={inputClass} /></label>
        </div>
        <button disabled={busy || loading || !!loadError} className={buttonClass}>Create itinerary</button>
      </form>
      {error && <p role="alert" className="mt-5 text-red-300">{error}</p>}
      {loading && <p role="status" className="mt-5">Loading itineraries…</p>}
      {loadError && <div className="mt-5"><p role="alert">{loadError}</p><button disabled={loading} onClick={() => {
        setLoadError(''); setLoading(true); setLoadAttempt((value) => value + 1)
      }} className={buttonClass}>Retry itineraries</button></div>}
      {savedLoading && <p role="status" className="mt-5">Loading saved places and events…</p>}
      {savedError && <div className="mt-5"><p role="alert">{savedError}</p><button disabled={savedLoading} onClick={() => {
        setSavedError(''); setSavedLoading(true); setSavedAttempt((value) => value + 1)
      }} className={buttonClass}>Retry saved content</button></div>}
      {!loading && !loadError && !items.length && <p className="mt-5 text-white/60">No itineraries yet. Create your first trip above.</p>}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {items.map((trip) => (
          <section key={trip.id} aria-label={trip.name} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">{trip.name}</h2>
            <div className="my-4 space-y-2 rounded-xl bg-black/20 p-4">
              <p className="text-sm text-white/70">{trip.is_public ? 'Link sharing is on.' : 'This trip is private.'} Anyone with an enabled link can see the trip name, dates, stop titles and visit times. Notes and account details are excluded. Turning sharing off cannot erase copies already viewed or saved.</p>
              {trip.is_public && sharingOrigin && <label className="block">Read-only sharing link<input readOnly value={`${sharingOrigin}/shared-trip#${trip.share_token}`} onFocus={(event) => event.target.select()} className={inputClass} /></label>}
              {trip.is_public && !sharingOrigin && <p className="text-sm text-white/70">Sharing is enabled, but website links are unavailable in this app build. You can still turn sharing off.</p>}
              <button disabled={busy || !!editing || !!noteDraft || !!scheduleDraft} onClick={() => changeSharing(trip, !trip.is_public)} className={buttonClass}>{trip.is_public ? 'Turn off sharing' : 'Enable sharing link'}</button>
              {trip.is_public && <button disabled={busy} onClick={() => changeSharing(trip, true)} className={buttonClass}>Replace sharing link</button>}
            </div>
            {editing?.original.id === trip.id ? (
              <form onSubmit={saveDetails} className="my-4 space-y-3">
                <fieldset disabled={busy} className="space-y-3">
                  <label className="block">Edit itinerary name<input required maxLength={120} value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} className={inputClass} /></label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label>Edit start date<input type="date" value={editing.start} onChange={(event) => setEditing({ ...editing, start: event.target.value })} className={inputClass} /></label>
                    <label>Edit end date<input type="date" value={editing.end} onChange={(event) => setEditing({ ...editing, end: event.target.value })} className={inputClass} /></label>
                  </div>
                  <button className={buttonClass}>Save trip details</button>
                  <button type="button" onClick={() => { setEditing(null); setError('') }} className={buttonClass}>Cancel editing</button>
                </fieldset>
              </form>
            ) : <button disabled={busy || editing !== null} onClick={() => {
              setError('')
              setConfirmDelete(null)
              setEditing({ original: trip, name: trip.name, start: trip.starts_on || '', end: trip.ends_on || '' })
            }} className={buttonClass}>Edit trip details</button>}
            <button disabled={busy} onClick={() => duplicateTrip(trip.id)} className={buttonClass}>Duplicate itinerary</button>
            <p className="mt-2 text-sm text-white/60">{trip.starts_on || 'Start date not set'} — {trip.ends_on || 'End date not set'}</p>
            <ItineraryDirections key={trip.itinerary_items.map((stop) => stop.id).join(',')} stops={trip.itinerary_items} />
            <button disabled={busy || !!editing || !!noteDraft || !!scheduleDraft || !trip.itinerary_items.some((stop) => stop.starts_at)} onClick={() => perform(() => downloadItineraryCalendar(trip))} className={buttonClass}>Export calendar (.ics)</button>
            <p className="mt-2 text-sm text-white/60">Exports saved visit times and notes for {trip.itinerary_items.filter((stop) => stop.starts_at).length} scheduled stops. Unscheduled stops are omitted. Import the file into your calendar; later edits do not sync automatically. No visit duration or reminder is added.</p>
            <ol className="mt-5 space-y-2">
              {trip.itinerary_items.map((stop, index) => (
                <li key={stop.id} className="rounded-xl bg-black/20 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>{index + 1}. {stop.title}</span>
                  <div className="flex flex-wrap gap-2">
                    <button disabled={busy || index === 0} onClick={() => moveStop(trip, index, -1)} aria-label={'Move ' + stop.title + ' up'} className={buttonClass}>Up</button>
                    <button disabled={busy || index === trip.itinerary_items.length - 1} onClick={() => moveStop(trip, index, 1)} aria-label={'Move ' + stop.title + ' down'} className={buttonClass}>Down</button>
                  <button disabled={busy || noteDraft?.original.id === stop.id || scheduleDraft?.original.id === stop.id} onClick={() => removeStop(trip.id, stop.id)} aria-label={'Remove ' + stop.title} className={buttonClass}>Remove</button>
                  </div>
                  </div>
                  {stop.notes && <p className="mt-3 whitespace-pre-wrap break-words text-sm text-white/75">{stop.notes}</p>}
                  <p className="mt-3 text-sm text-white/75">{stop.starts_at ? displaySchedule(stop.starts_at) : 'Time not scheduled'}</p>
                  {scheduleDraft?.original.id === stop.id ? <form onSubmit={saveSchedule} className="mt-3">
                    <fieldset disabled={busy}>
                      <label className="block">Visit time for {stop.title}<input type="datetime-local" value={scheduleDraft.value} onChange={(event) => setScheduleDraft({ ...scheduleDraft, value: event.target.value })} className={inputClass} /></label>
                      <p className="my-2 text-sm text-white/60">Uses your device time zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}. Leave blank to remove the schedule. During a repeated clock-change hour, the earlier time is used. Scheduling does not book admission or send reminders.</p>
                      <button className={buttonClass}>Save visit time</button>
                      <button type="button" onClick={() => { setScheduleDraft(null); setError('') }} className={buttonClass}>Cancel schedule</button>
                    </fieldset>
                  </form> : <button disabled={busy || scheduleDraft !== null} aria-label={'Schedule ' + stop.title} onClick={() => {
                    setError(''); setConfirmDelete(null)
                    setScheduleDraft({ tripId: trip.id, original: stop, value: localScheduleValue(stop.starts_at) })
                  }} className={buttonClass}>{stop.starts_at ? 'Edit visit time' : 'Set visit time'}</button>}
                  {noteDraft?.original.id === stop.id ? (
                    <form onSubmit={saveNotes} className="mt-3">
                      <fieldset disabled={busy}>
                        <label className="block">Notes for {stop.title}
                          <textarea maxLength={2000} rows={4} value={noteDraft.text} onChange={(event) => setNoteDraft({ ...noteDraft, text: event.target.value })} className={inputClass} />
                        </label>
                        <p className="mb-2 text-sm text-white/60">{noteDraft.text.length} / 2,000 characters</p>
                        <button className={buttonClass}>Save notes</button>
                        <button type="button" onClick={() => { setNoteDraft(null); setError('') }} className={buttonClass}>Cancel notes</button>
                      </fieldset>
                    </form>
                  ) : <button disabled={busy || noteDraft !== null} onClick={() => {
                    setError(''); setConfirmDelete(null)
                    setNoteDraft({ tripId: trip.id, original: stop, text: stop.notes || '' })
                  }} aria-label={'Edit notes for ' + stop.title} className={buttonClass}>{stop.notes ? 'Edit notes' : 'Add notes'}</button>}
                </li>
              ))}
            </ol>
            <form onSubmit={(event) => { event.preventDefault(); addStop(trip) }} className="mt-5">
              <label className="block">Custom stop<input required maxLength={240} value={drafts[trip.id] || ''} onChange={(event) => setDrafts((current) => ({ ...current, [trip.id]: event.target.value }))} className={inputClass} /></label>
              <button disabled={busy} className={buttonClass}>Add custom stop</button>
            </form>
            <label className="mt-5 block">Saved place or event
              <select disabled={savedLoading || !!savedError || busy} value={selections[trip.id] || ''} onChange={(event) => setSelections((current) => ({ ...current, [trip.id]: event.target.value }))} className={inputClass}>
                <option value="">Choose saved content</option>
                {choices.map((choice) => <option key={choice.key} value={choice.key}>{choice.title} ({choice.item_type})</option>)}
              </select>
            </label>
            <button disabled={busy || savedLoading || !!savedError || !selections[trip.id]} onClick={() => addStop(trip, choices.find((choice) => choice.key === selections[trip.id]))} className={buttonClass}>Add saved stop</button>
            <div className="mt-6">
              {confirmDelete === trip.id ? (
                <div><p>Delete this itinerary and all its stops?</p><button disabled={busy} onClick={() => removeTrip(trip.id)} className={buttonClass}>Confirm deletion</button><button disabled={busy} onClick={() => setConfirmDelete(null)} className={buttonClass}>Cancel</button></div>
              ) : <button disabled={busy || editing?.original.id === trip.id || noteDraft?.tripId === trip.id || scheduleDraft?.tripId === trip.id} onClick={() => setConfirmDelete(trip.id)} className={buttonClass}>Delete itinerary</button>}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  )
}
