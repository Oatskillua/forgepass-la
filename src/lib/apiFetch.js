import { Capacitor } from '@capacitor/core'
import { getPublicWebOrigin } from './publicWebOrigin'

export async function apiFetch(endpoint, options) {
  if (typeof endpoint !== 'string' || !/^\/api\/[a-z-]+(?:\?[^#]*)?$/.test(endpoint)) throw new Error('Unsupported API endpoint.')
  if (!Capacitor.isNativePlatform()) return fetch(endpoint, options)
  const origin = getPublicWebOrigin({ configured: import.meta.env.VITE_API_ORIGIN, native: true })
  return fetch(origin + endpoint, { ...options, credentials: 'omit', redirect: 'error' })
}
