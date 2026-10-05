export async function verifyTurnstileToken(token, remoteIp, signal = AbortSignal.timeout(8000)) {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    return {
      success: false,
      error: 'Missing Turnstile secret.',
    }
  }

  if (typeof token !== 'string' || !token.trim() || token.length > 2048) {
    return {
      success: false,
      error: 'Missing Turnstile token.',
    }
  }

  const formData = new FormData()
  formData.append('secret', secret)
  formData.append('response', token)

  if (remoteIp) {
    formData.append('remoteip', remoteIp)
  }

  const result = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      body: formData,
      signal,
      redirect: 'error',
    },
  )

  if (!result.ok) throw new Error('Security verification unavailable.')
  const data = await result.json()
  if (typeof data?.success !== 'boolean') throw new Error('Security verification response invalid.')
  return { success: data.success }
}
