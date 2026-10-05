import { useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PwaUpdatePrompt() {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!offlineReady && !needRefresh) return null

  const dismiss = () => {
    if (lock.current) return
    setOfflineReady(false)
    setNeedRefresh(false)
    setError('')
  }

  const reload = async () => {
    if (lock.current) return
    lock.current = true
    setUpdating(true)
    setError('')
    try { await updateServiceWorker(true) }
    catch { setError('The update could not be applied. Your page is still open. Try again when connected.') }
    finally { lock.current = false; setUpdating(false) }
  }

  return (
    <aside className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-cyan-300/30 bg-[#101827] p-4 shadow-2xl" role="status">
      <p className="font-bold text-white">{needRefresh ? 'ForgePass update available' : 'ForgePass is ready offline'}</p>
      <p className="mt-1 text-sm text-white/60">{needRefresh ? 'Save your work before reloading.' : 'The application shell is available offline. Events and account data require a connection.'}</p>
      {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
      <div className="mt-4 flex gap-2">
        {needRefresh && <button type="button" disabled={updating} onClick={reload} className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-black disabled:opacity-50">{updating ? 'Updating…' : 'Reload'}</button>}
        <button type="button" disabled={updating} onClick={dismiss} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Dismiss</button>
      </div>
    </aside>
  )
}
