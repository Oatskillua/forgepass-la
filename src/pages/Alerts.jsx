import { useEffect, useRef, useState } from 'react'

import { useAuth } from '../auth/AuthContext'
import AppNav from '../components/app/AppNav'
import PageShell from '../components/PageShell'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../lib/userData'

export default function Alerts() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const [olderPage, setOlderPage] = useState(false)
  const lock = useRef(false)

  useEffect(() => {
    let active = true
    getNotifications(user.id)
      .then((data) => { if (active) setNotifications(data) })
      .catch(() => { if (active) setLoadError('Unable to load alerts. Try again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user.id, attempt])

  const markRead = async (id) => {
    if (lock.current || loading || loadError) return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      const updated = id ? [await markNotificationRead(id)] : await markAllNotificationsRead(user.id, notifications.filter((item) => !item.read_at).map((item) => item.id))
      const confirmed = new Map(updated.map((item) => [item.id, item.read_at]))
      setNotifications((current) => current.map((item) => confirmed.has(item.id) ? { ...item, read_at: confirmed.get(item.id) } : item))
    } catch (readError) {
      setError(readError.message || 'Unable to confirm the update. Refresh alerts to check their status.')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  const unreadCount = notifications.filter((item) => !item.read_at).length

  async function older() {
    if (lock.current || loading || notifications.length < 100) return
    lock.current = true; setBusy(true); setError('')
    try {
      const last = notifications[notifications.length - 1]
      const data = await getNotifications(user.id, { id: last.id, created_at: last.created_at })
      setNotifications(data); setOlderPage(true)
    } catch { setError('Unable to load older alerts. Your current page is unchanged; please retry.') }
    finally { lock.current = false; setBusy(false) }
  }

  return (
    <PageShell eyebrow="City intelligence" title="Alerts" subtitle="Event reminders, transportation notices, city updates, and reward activity.">
      <AppNav />
      <div className="flex flex-wrap items-center justify-between gap-4">
        {!loading && !loadError && <p className="text-white/60">{unreadCount} unread among {notifications.length} shown alerts (up to 100 per page)</p>}
        <button disabled={busy || loading} onClick={() => { setLoading(true); setLoadError(''); setError(''); setOlderPage(false); setAttempt((value) => value + 1) }} className="rounded-xl border border-white/15 px-4 py-2 text-sm disabled:opacity-40">{loadError ? 'Retry alerts' : olderPage ? 'Show latest alerts' : 'Refresh alerts'}</button>
        <button disabled={busy || loading || !!loadError || notifications.length < 100} onClick={older} className="rounded-xl border border-white/15 px-4 py-2 text-sm disabled:opacity-40">Older alerts</button>
        <button type="button" onClick={() => markRead()} disabled={busy || loading || !!loadError || !unreadCount} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold disabled:opacity-40">Mark shown alerts read</button>
      </div>
      {error && <p role="alert" className="mt-5 text-red-300">{error}</p>}
      {loadError && <p role="alert" className="mt-5 text-red-300">{loadError}</p>}
      {loading && <p role="status" className="mt-5">Loading alerts…</p>}
      {!loading && !loadError && olderPage && !notifications.length && <p role="status" className="mt-5">No older alerts. Select Show latest alerts to return.</p>}
      {!loading && !loadError && !(olderPage && !notifications.length) && (!notifications.length ? <p className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-white/50">No alerts yet.</p> : <ul className="mt-6 space-y-3">{notifications.map((notification) => <li key={notification.id} className={`rounded-2xl border p-5 ${notification.read_at ? 'border-white/10 bg-white/[0.03]' : 'border-cyan-300/25 bg-cyan-300/10'}`}><div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">{notification.category}</p><h2 className="mt-2 font-bold">{notification.title}</h2><p className="mt-2 text-sm leading-6 text-white/60">{notification.body}</p></div>{!notification.read_at && <button type="button" disabled={busy} aria-label={'Mark ' + notification.title + ' read'} onClick={() => markRead(notification.id)} className="whitespace-nowrap text-sm text-cyan-200 disabled:opacity-40">Mark read</button>}</div></li>)}</ul>)}
    </PageShell>
  )
}
