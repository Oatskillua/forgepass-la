import { useEffect, useRef, useState } from 'react'
import { Bell, CalendarDays, Compass, Gift, MapPinned } from 'lucide-react'
import { Link } from 'react-router-dom'

import PageShell from '../components/PageShell'
import { useAuth } from '../auth/AuthContext'
import AppNav from '../components/app/AppNav'
import { getUserSummary } from '../lib/userData'

const modules = [
  { title: 'Discover', detail: 'Find places across Los Angeles.', icon: Compass, to: '/discover' },
  { title: 'Saved events', detail: 'Keep upcoming experiences organized.', icon: CalendarDays, to: '/app/saved' },
  { title: 'Itineraries', detail: 'Build and reorder city plans.', icon: MapPinned, to: '/app/itineraries' },
  { title: 'Rewards', detail: 'Track points, perks, and redemptions.', icon: Gift, to: '/app/rewards' },
  { title: 'Alerts', detail: 'Control reminders and city notices.', icon: Bell, to: '/app/alerts' },
  { title: 'Smart navigation', detail: 'Plan a route and launch directions.', icon: MapPinned, to: '/map' },
]

export default function UserDashboard() {
  const { user, signOut } = useAuth()
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  const signOutLock = useRef(false)

  useEffect(() => {
    let active = true
    getUserSummary(user.id).then((data) => { if (active) setSummary(data) })
      .catch(() => { if (active) setError('Unable to load account counts. Try again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user.id, attempt])

  async function handleSignOut() {
    if (signOutLock.current) return
    signOutLock.current = true
    setSigningOut(true)
    setSignOutError('')
    try {
      const result = await signOut()
      if (result?.error) throw result.error
    } catch {
      setSignOutError('Sign-out could not be confirmed. Please try again.')
    } finally {
      signOutLock.current = false
      setSigningOut(false)
    }
  }

  return (
    <PageShell
      eyebrow="Your ForgePass"
      title="City dashboard"
      subtitle={`Signed in as ${user.email}`}
    >
      <AppNav />

      {error && <p role="alert" className="mb-6 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-red-200">{error}</p>}
      {loading && <p role="status" className="mb-4 text-white/60">Loading account counts…</p>}
      <button disabled={loading || signingOut} onClick={() => {
        setLoading(true); setError(''); setSummary(null); setAttempt((value) => value + 1)
      }} className="mb-5 rounded-xl border border-white/15 px-4 py-2 text-sm disabled:opacity-40">{error ? 'Retry account counts' : 'Refresh account counts'}</button>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          ['Saved places', summary?.favoriteCount ?? '—'],
          ['Saved events', summary?.savedEventCount ?? '—'],
          ['Itineraries', summary?.itineraryCount ?? '—'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-3xl font-black text-cyan-300">{value}</p>
            <p className="mt-1 text-sm text-white/55">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {modules.map(({ title, detail, icon: Icon, to }) => (
          <Link key={title} to={to} className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-300/30">
            <Icon className="h-7 w-7 text-cyan-300" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">{detail}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/app/itineraries" className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-black">Create an itinerary</Link>
        <Link to="/app/saved" className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold text-white/80">View saved content</Link>
      </div>

      {signOutError && <p role="alert" className="mt-6 text-red-300">{signOutError}</p>}
      <button type="button" disabled={signingOut} onClick={handleSignOut} className="mt-8 rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold text-white/80 disabled:opacity-40">
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </PageShell>
  )
}
