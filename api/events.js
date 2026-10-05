const DEFAULT_CITY = 'Los Angeles'
const DEFAULT_SIZE = 12

function safeUrl(value) {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''
  } catch { return '' }
}

function text(value) { return typeof value === 'string' ? value : '' }

import { handleCors } from './_lib/cors.js'
import { checkRateLimit, getClientIp } from './_lib/rateLimit.js'

export default async function handler(request, response) {
  if (handleCors(request, response, 'GET')) return
  response.setHeader('Cache-Control', 'no-store')
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET, OPTIONS')
    return response.status(405).json({ error: 'Method not allowed.' })
  }
  const query = request.query || {}
  const city = query.city === undefined ? DEFAULT_CITY : query.city
  const keyword = query.keyword === undefined ? '' : query.keyword
  const rawSize = query.size === undefined ? String(DEFAULT_SIZE) : query.size
  const rawPage = query.page === undefined ? '0' : query.page
  if (typeof rawPage !== 'string' || !/^\d{1,3}$/.test(rawPage) || Number(rawPage) * Number(rawSize) >= 1000) {
    return response.status(400).json({ error: 'Choose a valid event page within the search limit.' })
  }
  if (typeof city !== 'string' || !city.trim() || city.length > 120 || typeof keyword !== 'string' || keyword.length > 200 || typeof rawSize !== 'string' || !/^\d{1,2}$/.test(rawSize) || Number(rawSize) < 1 || Number(rawSize) > 50) {
    return response.status(400).json({ error: 'Use a city of up to 120 characters, a search of up to 200 characters, and a size from 1 to 50.' })
  }
  const controller = new AbortController()
  const rate = checkRateLimit({ key: `events:${getClientIp(request)}`, limit: 30, windowMs: 60000 })
  if (!rate.allowed) {
    response.setHeader('Retry-After', String(Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))))
    return response.status(429).json({ error: 'Too many event searches. Please wait before trying again.' })
  }
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const apiKey = process.env.TICKETMASTER_API_KEY

    if (!apiKey) {
      return response.status(503).json({
        error: 'Event search is temporarily unavailable.',
      })
    }

    const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json')

    url.searchParams.set('apikey', apiKey)
    url.searchParams.set('city', city.trim())
    url.searchParams.set('size', String(Number(rawSize)))
    url.searchParams.set('page', String(Number(rawPage)))
    url.searchParams.set('sort', 'date,asc')

    if (keyword) {
      url.searchParams.set('keyword', keyword.trim())
    }

    const ticketmasterResponse = await fetch(url, { signal: controller.signal, redirect: 'error' })

    if (!ticketmasterResponse.ok) {
      return response.status(502).json({
        error: 'The event provider is unavailable. Please try again.',
      })
    }

    const data = await ticketmasterResponse.json()
    const events = data?._embedded?.events ?? (data?.page?.totalElements === 0 ? [] : null)
    if (!Array.isArray(events) || events.length > Number(rawSize) || events.some((event) => !event || typeof event.id !== 'string' || !event.id || typeof event.name !== 'string' || !event.name || !safeUrl(event.url))) {
      throw new Error('Invalid event provider response')
    }
    if (data.page?.number !== undefined && data.page.number !== Number(rawPage)) throw new Error('Unexpected provider page')
    if (data.page?.totalPages !== undefined && (!Number.isInteger(data.page.totalPages) || data.page.totalPages < 0)) throw new Error('Invalid provider page count')
    const withinLimit = (Number(rawPage) + 1) * Number(rawSize) < 1000

    return response.status(200).json({
      page: Number(rawPage),
      hasMore: withinLimit && Number.isInteger(data.page?.totalPages) && Number(rawPage) + 1 < data.page.totalPages,
      searchLimitReached: !withinLimit && Number.isInteger(data.page?.totalPages) && Number(rawPage) + 1 < data.page.totalPages,
      events: events.map((event) => ({
        id: event.id,
        name: event.name,
        url: safeUrl(event.url),
        date: text(event.dates?.start?.localDate),
        time: text(event.dates?.start?.localTime),
        image: safeUrl(event.images?.[0]?.url),
        venue: text(event._embedded?.venues?.[0]?.name),
        city: text(event._embedded?.venues?.[0]?.city?.name),
      })),
    })
  } catch {
    return response.status(controller.signal.aborted ? 504 : 502).json({
      error: controller.signal.aborted ? 'Event search timed out. Please try again.' : 'Unable to load events from the provider. Please try again.',
    })
  } finally { clearTimeout(timeout) }
}
