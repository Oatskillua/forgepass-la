import { useEffect, useRef, useState } from 'react'

import { useAuth } from '../auth/AuthContext'
import AppNav from '../components/app/AppNav'
import PageShell from '../components/PageShell'
import { getAccountSettings, saveAccountSettings } from '../lib/userData'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({ full_name: '', home_city: '' })
  const [preferences, setPreferences] = useState({ event_reminders: true, city_alerts: true, transportation: true, rewards: true, marketing: false })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)

  useEffect(() => {
    let active = true
    getAccountSettings(user.id).then((data) => {
      if (!active) return
      setProfile(data.profile)
      setPreferences(data.preferences)
    }).catch(() => { if (active) setLoadError('Unable to load your settings. Try again before saving.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user.id, attempt])

  const save = async (event) => {
    event.preventDefault()
    if (lock.current || loading || loadError) return
    lock.current = true
    setBusy(true)
    setError('')
    setStatus('')

    try {
      await saveAccountSettings(profile, preferences)
      setStatus('Profile and notification preferences saved.')
    } catch {
      setError('Could not confirm the save. Your entries are preserved; retry to save these settings.')
    } finally { lock.current = false; setBusy(false) }
  }

  return (
    <PageShell eyebrow="Account" title="Profile and preferences" subtitle="Control personal details and communication consent.">
      <AppNav />
      {loading && <p role="status">Loading account settings…</p>}
      {loadError && <div><p role="alert">{loadError}</p><button onClick={() => { setLoadError(''); setLoading(true); setAttempt((value) => value + 1) }}>Retry settings</button></div>}
      <form onSubmit={save} className="mx-auto max-w-2xl space-y-7 rounded-3xl border border-white/10 bg-white/5 p-7">
        <fieldset disabled={loading || !!loadError || busy} className="space-y-7" onChange={() => { setStatus(''); setError('') }}>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-white/75">Full name<input maxLength={120} value={profile.full_name || ''} onChange={(event) => setProfile((current) => ({ ...current, full_name: event.target.value }))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" /></label>
          <label className="text-sm font-semibold text-white/75">Home city<input maxLength={120} value={profile.home_city || ''} onChange={(event) => setProfile((current) => ({ ...current, home_city: event.target.value }))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" /></label>
        </div>
        <fieldset>
          <legend className="text-lg font-bold">Notifications</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ['event_reminders', 'Event reminders'],
              ['city_alerts', 'City and safety alerts'],
              ['transportation', 'Transportation notices'],
              ['rewards', 'Reward updates'],
              ['marketing', 'Marketing messages'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 rounded-xl bg-black/20 p-3 text-sm text-white/75">
                <input type="checkbox" checked={preferences[key]} onChange={(event) => setPreferences((current) => ({ ...current, [key]: event.target.checked }))} className="h-4 w-4 accent-cyan-300" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        {status && <p role="status" className="text-sm text-emerald-300">{status}</p>}
        <button className="rounded-2xl bg-cyan-300 px-6 py-3 font-bold text-black">Save changes</button>
        </fieldset>
      </form>
    </PageShell>
  )
}
