import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import InfoCard from './InfoCard'
import { savePlace } from '../lib/userData'

export default function SavePlaceCard({ item, userId }) {
  return <AccountPlaceCard key={userId || 'anonymous'} item={item} userId={userId} />
}

function AccountPlaceCard({ item, userId }) {
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  async function save() {
    if (!userId || lock.current || saved) return
    lock.current = true
    setBusy(true); setError('')
    try { await savePlace(userId, item); setSaved(true) }
    catch { setError('Unable to confirm the save. Please retry.') }
    finally { lock.current = false; setBusy(false) }
  }
  return <InfoCard {...item} actionLabel={saved ? 'Saved' : busy ? 'Saving…' : 'Save place'} actionDisabled={busy || saved} onAction={userId ? save : undefined}>
    {!userId && <Link to="/auth" className="mt-5 inline-block rounded-xl border border-cyan-300/30 px-4 py-2 text-sm font-bold text-cyan-200">Sign in to save</Link>}
    {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
  </InfoCard>
}
