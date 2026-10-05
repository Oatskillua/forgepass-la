import { apiFetch } from './apiFetch'

export async function submitIntake(endpoint, payload, timeoutMs = 15000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await apiFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    let data
    try { data = await response.json() } catch {
      throw new Error('The server returned an unreadable response. Your submission could not be confirmed.')
    }
    if (!response.ok) {
      const failure = new Error(response.status === 409
        ? 'This email is already on the waitlist.'
        : response.status === 429 ? 'Too many requests. Please wait before trying again.'
          : response.status === 403 ? 'Security check failed. Complete a new check and retry.'
            : 'Submission could not be confirmed. Please try again.')
      failure.status = response.status
      throw failure
    }
    if (data?.ok !== true) throw new Error('The server did not confirm your submission.')
    return data
  } catch (failure) {
    if (controller.signal.aborted) throw new Error('The request timed out. Submission status is unknown; your entries are preserved.', { cause: failure })
    if (failure instanceof TypeError) throw new Error('Connection interrupted. Submission status is unknown; your entries are preserved.', { cause: failure })
    throw failure
  } finally {
    clearTimeout(timer)
  }
}
