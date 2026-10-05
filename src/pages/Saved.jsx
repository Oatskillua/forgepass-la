import { useEffect, useRef, useState } from 'react'

import { useAuth } from '../auth/AuthContext'
import AppNav from '../components/app/AppNav'
import PageShell from '../components/PageShell'
import { getSavedContent, removeSavedItem } from '../lib/userData'

export default function Saved() {
  const { user } = useAuth()
  const [content, setContent] = useState({ favorites: [], events: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)

  useEffect(() => {
    let active = true
    getSavedContent(user.id)
      .then((data) => { if (active) setContent(data) })
      .catch(() => { if (active) setLoadError('Unable to load saved content. Try again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user.id, attempt])

  const remove = async (table, id) => {
    if (lock.current || loading || loadError) return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      await removeSavedItem(table, id)
      const key = table === 'favorites' ? 'favorites' : 'events'
      setContent((current) => ({ ...current, [key]: current[key].filter((item) => item.id !== id) }))
    } catch (removeError) {
      setError(removeError.message || 'Unable to confirm removal. Refresh saved content to check its status.')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  return (
    <PageShell eyebrow="Your ForgePass" title="Saved places and events" subtitle="Your personal Los Angeles collection.">
      <AppNav />
      <button disabled={busy || loading} onClick={() => {
        setLoading(true); setLoadError(''); setError(''); setAttempt((value) => value + 1)
      }} className="mb-5 rounded-xl border border-cyan-300/40 px-4 py-3 text-sm text-cyan-200 disabled:opacity-40">
        {loadError ? 'Retry saved content' : 'Refresh saved content'}
      </button>
      {error && <p role="alert" className="mb-6 text-red-300">{error}</p>}
      {loadError && <p role="alert" className="mb-6 text-red-300">{loadError}</p>}
      {loading ? <p role="status" className="text-white/60">Loading saved content…</p> : !loadError && (
        <div className="grid gap-8 lg:grid-cols-2">
          {[
            ['Saved places', 'favorites', content.favorites, 'place_name'],
            ['Saved events', 'saved_events', content.events, 'event_name'],
          ].map(([heading, table, items, titleKey]) => (
            <section key={heading} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-bold">{heading}</h2>
              {items.length === 0 ? <p className="mt-4 text-white/50">Nothing saved yet.</p> : (
                <ul className="mt-5 space-y-3">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-black/20 p-4">
                      <span className="font-semibold">{item[titleKey]}</span>
                      <button type="button" disabled={busy} aria-label={'Remove ' + item[titleKey]} onClick={() => remove(table, item.id)} className="text-sm text-red-200 disabled:opacity-40">Remove</button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </PageShell>
  )
}
