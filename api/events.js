const DEFAULT_CITY = 'Los Angeles'
const DEFAULT_SIZE = 12

export default async function handler(request, response) {
  try {
    const apiKey = process.env.TICKETMASTER_API_KEY

    if (!apiKey) {
      return response.status(500).json({
        error: 'Missing Ticketmaster API key.',
      })
    }

    const city = request.query.city || DEFAULT_CITY
    const size = request.query.size || DEFAULT_SIZE

    const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json')

    url.searchParams.set('apikey', apiKey)
    url.searchParams.set('city', city)
    url.searchParams.set('size', size)
    url.searchParams.set('sort', 'date,asc')

    const ticketmasterResponse = await fetch(url)

    if (!ticketmasterResponse.ok) {
      return response.status(500).json({
        error: 'Failed to load events.',
      })
    }

    const data = await ticketmasterResponse.json()
    const events = data?._embedded?.events || []

    return response.status(200).json({
      events: events.map((event) => ({
        id: event.id,
        name: event.name,
        url: event.url,
        date: event.dates?.start?.localDate || '',
        time: event.dates?.start?.localTime || '',
        image: event.images?.[0]?.url || '',
        venue: event._embedded?.venues?.[0]?.name || '',
        city: event._embedded?.venues?.[0]?.city?.name || '',
      })),
    })
  } catch (error) {
    return response.status(500).json({
      error: error.message || 'Unexpected server error.',
    })
  }
}