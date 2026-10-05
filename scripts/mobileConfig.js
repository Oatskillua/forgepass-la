const originVariables = ['VITE_SUPABASE_URL', 'VITE_PUBLIC_SITE_URL', 'VITE_API_ORIGIN']

export function validateMobileConfig(settings) {
  const problems = []
  for (const name of originVariables) {
    const value = settings[name]?.trim()
    if (!value) { problems.push(`${name} is required.`); continue }
    try {
      const url = new URL(value)
      if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error()
    } catch { problems.push(`${name} must be a remote HTTPS origin without credentials, a path, query or fragment.`) }
  }
  if (!settings.VITE_SUPABASE_ANON_KEY?.trim()) problems.push('VITE_SUPABASE_ANON_KEY is required and must contain the public client key.')
  return problems
}
