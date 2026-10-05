import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import AppNav from '../components/app/AppNav'
import PageShell from '../components/PageShell'
import { getRewardHistory, getRewards, redeemReward } from '../lib/userData'
import { readPendingRedemption, savePendingRedemption, clearPendingRedemption } from '../lib/redemptionRecovery'

export default function AppRewards() {
  const { user } = useAuth()
  return <RewardsWallet key={user.id} userId={user.id} />
}

function RewardsWallet({ userId }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [selection, setSelection] = useState(null)
  const [busy, setBusy] = useState(false)
  const [receipt, setReceipt] = useState('')
  const [recovery, setRecovery] = useState(() => {
    try { return { pending: readPendingRedemption(userId), blocked: false } }
    catch { return { pending: null, blocked: true } }
  })
  const [loading, setLoading] = useState(true)
  const [stale, setStale] = useState(false)
  const [olderHistory, setOlderHistory] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const lock = useRef(false)

  useEffect(() => {
    let active = true
    getRewards(userId).then((result) => { if (active) setData(result) })
      .catch((failure) => { if (active) setError(failure.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [userId])

  async function refresh() {
    if (lock.current || loading) return
    lock.current = true
    setBusy(true)
    try {
      setData(await getRewards(userId))
      setOlderHistory(false); setHistoryError('')
      setStale(false)
      setError('')
    } catch {
      setStale(true)
      setError('Rewards could not refresh. Please retry before starting a new redemption.')
    } finally { lock.current = false; setBusy(false) }
  }

  async function redeem() {
    if (lock.current || loading || recovery.blocked || (!selection && !recovery.pending)) return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      // Re-read before creating a key to recover a pending request from another view.
      const existing = readPendingRedemption(userId)
      const pending = existing || recovery.pending || {
        rewardId: selection.id, cost: selection.points_cost,
        title: selection.title, requestKey: crypto.randomUUID(),
      }
      savePendingRedemption(userId, pending)
      setRecovery({ pending, blocked: false })
      setSelection(null)
      let id
      try {
        id = await redeemReward(pending.rewardId, pending.cost, pending.requestKey)
      } catch (failure) {
        // Explicit PostgreSQL exceptions roll back the transaction. Network errors
        // are ambiguous: keep the original request key for a safe retry.
        if (failure.code === 'P0001') {
          clearPendingRedemption(userId)
          setRecovery({ pending: null, blocked: false })
        }
        throw failure
      }
      setReceipt(id)
      setStale(true)
      clearPendingRedemption(userId)
      setRecovery({ pending: null, blocked: false })
      try {
        setData(await getRewards(userId))
        setOlderHistory(false); setHistoryError('')
        setStale(false)
      } catch {
        setError('Redemption recorded, but the balance could not refresh. Refresh before redeeming again.')
      }
    } catch (failure) {
      setError(failure.message || 'Redemption status could not be confirmed. Retry the pending request.')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  async function loadHistory(older) {
    if (lock.current || loading || !data) return
    lock.current = true; setBusy(true); setHistoryError('')
    try {
      const last = data.transactions[data.transactions.length - 1]
      const transactions = await getRewardHistory(userId, older ? { id: last.id, created_at: last.created_at } : undefined)
      setData((current) => ({ ...current, transactions }))
      setOlderHistory(older)
    } catch { setHistoryError('Unable to load reward history. Your current page is unchanged; please retry.') }
    finally { lock.current = false; setBusy(false) }
  }

  const disabled = busy || loading || stale || recovery.blocked || Boolean(recovery.pending)
  return (
    <PageShell eyebrow="ForgePass Rewards" title="Rewards wallet" subtitle="Platform points, perks, and redemption history.">
      <AppNav />
      {receipt && <p role="status" className="mb-4 text-emerald-300">Redemption recorded. Reference: {receipt}</p>}
      {recovery.blocked && <p role="alert">Browser storage is unavailable or the saved request is invalid. Redemptions are paused to protect against duplicate charges.</p>}
      {recovery.pending && <section aria-label="Pending redemption" className="mb-6 rounded-xl border border-amber-300/30 p-4">
        <p>A redemption for {recovery.pending.title} needs confirmation. Retrying checks the same request and will not charge it twice.</p>
        <button disabled={busy || loading} onClick={redeem} className="mt-3 rounded-xl bg-cyan-300 p-3 text-black">Retry pending redemption</button>
      </section>}
      {selection && !recovery.pending && <section aria-label="Confirm redemption" className="mb-6 rounded-xl border border-cyan-300/30 p-4">
        <p>Redeem {selection.title} for {selection.points_cost} points?</p>
        <button disabled={busy} onClick={redeem} className="m-2 rounded-xl bg-cyan-300 p-3 text-black">Confirm redemption</button>
        <button disabled={busy} onClick={() => setSelection(null)} className="p-3">Cancel</button>
      </section>}
      {error && <p role="alert" className="mb-6 text-red-300">{error}</p>}
      {(stale || (!data && !loading)) && <button disabled={busy || loading} onClick={refresh} className="mb-5 rounded-xl border p-3">{data ? 'Refresh balance' : 'Retry rewards'}</button>}
      {loading && <p role="status">Loading rewards…</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6"><p>Available points{stale ? ' (needs refresh)' : ''}</p><p className="mt-2 text-5xl font-black text-cyan-300">{data?.account.available_points ?? '—'}</p></div>
        <div className="rounded-3xl border border-white/10 p-6"><p>Lifetime points</p><p className="mt-2 text-5xl font-black">{data?.account.lifetime_points ?? '—'}</p></div>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 p-6">
          <h2 className="text-2xl font-bold">Available rewards</h2>
          {data && !data.rewards.length && <p className="mt-4">No rewards are currently available.</p>}
          <ul className="mt-5 space-y-3">{data?.rewards.map((reward) => <li key={reward.id} className="rounded-2xl bg-black/20 p-4">
            <strong>{reward.title}</strong><p>{reward.points_cost} points</p><p className="mt-2 text-sm text-white/60">{reward.description}</p>
            <button disabled={disabled || reward.inventory === 0 || data.account.available_points < reward.points_cost}
              onClick={() => { setReceipt(''); setSelection(reward) }}
              className="mt-3 rounded-xl border border-cyan-300/40 p-3 disabled:opacity-40">
              {reward.inventory === 0 ? 'Sold out' : data.account.available_points < reward.points_cost ? 'More points needed' : 'Redeem'}
            </button>
          </li>)}</ul>
        </section>
        <section className="rounded-3xl border border-white/10 p-6">
          <h2 className="text-2xl font-bold">History</h2>
          <p className="mt-2 text-sm text-white/60">{olderHistory ? 'Older activity' : 'Latest activity'} · Up to 50 transactions per page.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button disabled={busy || loading || !data} onClick={() => loadHistory(false)} className="rounded-xl border p-3 disabled:opacity-40">Show latest activity</button>
            <button disabled={busy || loading || !data || data.transactions.length < 50} onClick={() => loadHistory(true)} className="rounded-xl border p-3 disabled:opacity-40">Older activity</button>
          </div>
          {historyError && <p role="alert" className="mt-3 text-red-300">{historyError}</p>}
          {data && !data.transactions.length && <p className="mt-4">{olderHistory ? 'No older reward activity.' : 'No reward activity yet.'}</p>}
          <ul className="mt-5 space-y-3">{data?.transactions.map((transaction) => <li key={transaction.id} className="flex justify-between gap-4 rounded-2xl bg-black/20 p-4">
            <span>{transaction.description}</span><strong>{transaction.points > 0 ? '+' : ''}{transaction.points}</strong>
          </li>)}</ul>
        </section>
      </div>
    </PageShell>
  )
}
