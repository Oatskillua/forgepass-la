import { afterEach, expect, it, vi } from 'vitest'
import { buildItineraryCalendar, downloadItineraryCalendar } from './itineraryCalendar'

const trip = { name: 'Weekend', itinerary_items: [
  { id: 's1', title: 'Concert', starts_at: '2026-10-10T11:30:00-07:00', notes: 'Bring tickets', item_type: 'event', location_snapshot: { venue: 'Hollywood Bowl', city: 'Los Angeles' } },
  { id: 's2', title: 'Unscheduled', starts_at: null },
] }
const now = new Date('2026-09-20T12:00:00Z')
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers() })

it('exports scheduled stops at their absolute times without inventing durations or reminders', () => {
  const calendar = buildItineraryCalendar(trip, now)
  expect(calendar).toContain('DTSTART:20261010T183000Z\r\n')
  expect(calendar).toContain('DTSTAMP:20260920T120000Z\r\n')
  expect(calendar).toContain('DESCRIPTION:Weekend\\n\\nBring tickets\r\n')
  expect(calendar).toContain('LOCATION:Hollywood Bowl\\, Los Angeles\r\n')
  expect(calendar).toContain('CLASS:PRIVATE\r\n')
  expect(calendar).not.toMatch(/Unscheduled|DTEND|DURATION|VALARM|ATTENDEE/)
  expect(calendar).toMatch(/^BEGIN:VCALENDAR\r\n/)
  expect(calendar).toMatch(/END:VCALENDAR\r\n$/)
})

it('keeps a stable event identity when exporting an edited stop', () => {
  const before = buildItineraryCalendar(trip, now).match(/^UID:.+$/m)[0]
  const edited = { ...trip, itinerary_items: [{ ...trip.itinerary_items[0], title: 'New title', starts_at: '2026-10-11T10:00:00Z' }] }
  expect(buildItineraryCalendar(edited, now).match(/^UID:.+$/m)[0]).toBe(before)
})

it('escapes text to prevent calendar property injection', () => {
  const calendar = buildItineraryCalendar({ name: 'Trip; A,B\\C', itinerary_items: [{ id: 's1', starts_at: '2026-10-10T10:00:00Z', title: 'Visit\r\nATTENDEE:someone@example.com', notes: 'One\rTwo' }] }, now)
  expect(calendar).toContain('SUMMARY:Visit\\nATTENDEE:someone@example.com\r\n')
  expect(calendar).toContain('DESCRIPTION:Trip\\; A\\,B\\\\C\\n\\nOne\\nTwo\r\n')
  expect(calendar).not.toMatch(/^ATTENDEE:/m)
})

it('folds long Unicode lines by bytes without losing characters', () => {
  const title = '博物館 🎟️ '.repeat(40)
  const calendar = buildItineraryCalendar({ ...trip, itinerary_items: [{ ...trip.itinerary_items[0], title }] }, now)
  for (const line of calendar.split('\r\n')) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
  expect(calendar.replace(/\r\n /g, '')).toContain(`SUMMARY:${title}\r\n`)
})

it('rejects empty schedules, invalid timestamps and invalid identifiers', () => {
  expect(() => buildItineraryCalendar({ ...trip, itinerary_items: [] })).toThrow('Set a visit time')
  for (const replacement of [{ starts_at: 'invalid' }, { id: 's1\nEND:VEVENT' }]) {
    expect(() => buildItineraryCalendar({ ...trip, itinerary_items: [{ ...trip.itinerary_items[0], ...replacement }] })).toThrow()
  }
})

it.each([false, true])('releases download resources even when clicking fails: %s', (fails) => {
  vi.useFakeTimers()
  const create = vi.fn(() => 'blob:calendar')
  const revoke = vi.fn()
  vi.stubGlobal('URL', { createObjectURL: create, revokeObjectURL: revoke })
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
    expect(this.download).toBe('forgepass-itinerary.ics')
    expect(this.href).toBe('blob:calendar')
    if (fails) throw new Error('Download blocked')
  })
  if (fails) expect(() => downloadItineraryCalendar(trip)).toThrow('Download blocked')
  else downloadItineraryCalendar(trip)
  expect(click).toHaveBeenCalledOnce()
  expect(create.mock.calls[0][0].type).toBe('text/calendar;charset=utf-8')
  expect(document.querySelector('a[download]')).toBeNull()
  vi.runAllTimers()
  expect(revoke).toHaveBeenCalledWith('blob:calendar')
})
