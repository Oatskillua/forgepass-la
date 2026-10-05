import { Capacitor } from '@capacitor/core'

export function getPublicWebOrigin({
  configured = import.meta.env.VITE_PUBLIC_SITE_URL,
  native = Capacitor.isNativePlatform(),
  browserOrigin = window.location.origin,
} = {}) {
  const explicit = typeof configured === 'string' && configured.trim()
  if (native && !explicit) throw new Error('Website links are unavailable in this app build. Please use the ForgePass website.')
  const candidate = explicit || browserOrigin
  try {
    const url = new URL(candidate)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error()
    if (explicit && (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) throw new Error()
    return url.origin
  } catch {
    throw new Error('Website links are unavailable in this app build. Please use the ForgePass website.')
  }
}
