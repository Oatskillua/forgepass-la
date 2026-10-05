// iCalendar text escaping, UTC dates and UTF-8 line folding follow RFC 5545.
function calendarText(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,')
    .split('').filter((character) => character.charCodeAt(0) >= 32 || character === '\t').join('')
}

function foldLine(line) {
  const encoder = new TextEncoder()
  const lines = []
  let current = ''
  let length = 0
  for (const character of line) {
    const size = encoder.encode(character).length
    if (length + size > 75) { lines.push(current); current = ' '; length = 1 }
    current += character
    length += size
  }
  lines.push(current)
  return lines.join('\r\n')
}

function calendarTime(value) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() < 1 || date.getUTCFullYear() > 9999) {
    throw new Error('A scheduled stop has an invalid time. Edit its visit time before exporting.')
  }
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

export function buildItineraryCalendar(trip, now = new Date()) {
  const stops = trip.itinerary_items.filter((stop) => stop.starts_at != null)
  if (!stops.length) throw new Error('Set a visit time on at least one stop before exporting.')
  const stamp = calendarTime(now)
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ForgePass LA//Itinerary Export//EN', 'CALSCALE:GREGORIAN']
  for (const stop of stops) {
    if (typeof stop.id !== 'string' || !/^[a-zA-Z0-9-]+$/.test(stop.id)) throw new Error('A stop cannot be exported. Refresh itineraries and try again.')
    lines.push('BEGIN:VEVENT', `UID:forgepass-stop-${stop.id}`, `DTSTAMP:${stamp}`, `DTSTART:${calendarTime(stop.starts_at)}`,
      `SUMMARY:${calendarText(stop.title)}`, `DESCRIPTION:${calendarText([trip.name, stop.notes].filter(Boolean).join('\n\n'))}`, 'CLASS:PRIVATE')
    const snapshot = stop.location_snapshot || {}
    if (stop.item_type === 'event' && typeof snapshot.venue === 'string' && snapshot.venue.trim()) {
      lines.push(`LOCATION:${calendarText([snapshot.venue, typeof snapshot.city === 'string' ? snapshot.city : ''].filter(Boolean).join(', '))}`)
    }
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.map(foldLine).join('\r\n') + '\r\n'
}

export function downloadItineraryCalendar(trip) {
  const contents = buildItineraryCalendar(trip)
  const url = URL.createObjectURL(new Blob([contents], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a')
  try {
    link.href = url
    link.download = 'forgepass-itinerary.ics'
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    // Give the browser time to consume the download URL before releasing it.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
