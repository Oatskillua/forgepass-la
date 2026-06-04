export async function verifyTurnstileToken(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    return {
      success: false,
      error: 'Missing Turnstile secret.',
    }
  }

  if (!token) {
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
    },
  )

  return result.json()
}