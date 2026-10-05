import { beforeEach, expect, it, vi } from 'vitest'
import { updateStopSchedule } from './userData'
import { deleteItinerary, getNotifications, getRewardHistory, getUserSummary, markAllNotificationsRead, markNotificationRead, removeSavedItem, updateItinerary, updateStopNotes } from './userData'

const request = vi.hoisted(() => vi.fn())
vi.mock('./supabase', async () => {
  const { createClient } = await import('@supabase/supabase-js')
  return { supabase: createClient('https://example.supabase.co', 'test-key', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: request },
  }) }
})
beforeEach(() => { request.mockReset() })

it.each([null, '2026-10-10T18:30:00+00:00'])('updates a schedule only if its original value is still %s', async (original) => {
  request.mockResolvedValue(new Response('[{"id":"s1","starts_at":null}]', { status: 200 }))
  await updateStopSchedule('t1', { id: 's1', starts_at: original }, null)
  const [url, options] = request.mock.calls[0]
  const query = new URL(url).searchParams
  expect(query.get('starts_at')).toBe(original === null ? 'is.null' : 'eq.' + original)
  expect(query.get('itinerary_id')).toBe('eq.t1')
  expect(JSON.parse(options.body)).toEqual({ starts_at: null })
})

it('rejects invalid times and unconfirmed schedule changes', async () => {
  await expect(updateStopSchedule('t1', { id: 's1' }, 'tomorrow')).rejects.toThrow('valid stop date')
  expect(request).not.toHaveBeenCalled()
  request.mockResolvedValue(new Response('[]', { status: 200 }))
  await expect(updateStopSchedule('t1', { id: 's1' }, '2026-10-10T18:30:00.000Z')).rejects.toThrow('schedule changed')
})

it('loads reward history in stable account-scoped pages', async () => {
  request.mockResolvedValue(new Response('[]', { status: 200 }))
  const before = { id: '00000000-0000-0000-0000-000000000001', created_at: '2026-09-19T10:00:00Z' }
  await getRewardHistory('u1', before)
  const url = new URL(request.mock.calls[0][0])
  expect(url.pathname).toBe('/rest/v1/reward_transactions')
  expect(url.searchParams.get('user_id')).toBe('eq.u1')
  expect(url.searchParams.get('order')).toBe('created_at.desc,id.desc')
  expect(url.searchParams.get('limit')).toBe('50')
  expect(url.searchParams.get('or')).toContain(`id.lt.${before.id}`)
})

it('rejects invalid reward-history cursors before sending a request', async () => {
  await expect(getRewardHistory('u1', { id: 'invalid', created_at: 'invalid' })).rejects.toThrow('Invalid history cursor')
  expect(request).not.toHaveBeenCalled()
})

it('paginates notifications using timestamp and ID without offset drift', async () => {
  request.mockResolvedValue(new Response('[]', { status: 200 }))
  const before = { id: '00000000-0000-0000-0000-000000000001', created_at: '2026-09-19T10:00:00+00:00' }
  await getNotifications('u1', before)
  const query = new URL(request.mock.calls[0][0]).searchParams
  expect(query.get('order')).toBe('created_at.desc,id.desc')
  expect(query.get('or')).toBe(`(created_at.lt.${before.created_at},and(created_at.eq.${before.created_at},id.lt.${before.id}))`)
  expect(query.get('user_id')).toBe('eq.u1')
  expect(query.get('limit')).toBe('100')
})

it('rejects malformed notification cursors before sending a request', async () => {
  await expect(getNotifications('u1', { id: 'bad,id', created_at: '2026-09-19' })).rejects.toThrow('Refresh alerts')
  expect(request).not.toHaveBeenCalled()
})

it('requires a returned trip ID before confirming deletion', async () => {
  request.mockResolvedValueOnce(new Response('[]', { status: 200 }))
  await expect(deleteItinerary('t1')).rejects.toThrow('Refresh itineraries')
  request.mockResolvedValueOnce(new Response('[{"id":"t1"}]', { status: 200 }))
  expect(await deleteItinerary('t1')).toEqual({ id: 't1' })
  const [url, options] = request.mock.calls[1]
  expect(new URL(url).searchParams.get('id')).toBe('eq.t1')
  expect(new URL(url).searchParams.get('select')).toBe('id')
  expect(options.method).toBe('DELETE')
})

it('does not turn missing database counts into zero', async () => {
  request.mockImplementation(async (url) => new Response(new URL(url).pathname.endsWith('/profiles') ? '{"full_name":"Owner"}' : null, { status: 200 }))
  await expect(getUserSummary('u1')).rejects.toThrow('Account counts are unavailable')
})

it('accepts confirmed zero counts', async () => {
  request.mockImplementation(async (url) => new Response(new URL(url).pathname.endsWith('/profiles') ? '{"full_name":"Owner"}' : null, { status: 200, headers: { 'content-range': '*/0' } }))
  expect(await getUserSummary('u1')).toMatchObject({ favoriteCount: 0, savedEventCount: 0, itineraryCount: 0 })
})

it('limits bulk read updates to the selected user and displayed unread alerts', async () => {
  request.mockResolvedValue(new Response('[{"id":"n1","read_at":"2026-09-19T10:00:00Z"}]', { status: 200 }))
  expect(await markAllNotificationsRead('u1', ['n1', 'n2'])).toHaveLength(1)
  const query = new URL(request.mock.calls[0][0]).searchParams
  expect(query.get('user_id')).toBe('eq.u1')
  expect(query.get('id')).toBe('in.(n1,n2)')
  expect(query.get('read_at')).toBe('is.null')
  expect(query.get('select')).toBe('id,read_at')
})

it('rejects unconfirmed single reads and avoids unrestricted bulk updates', async () => {
  await expect(markAllNotificationsRead('u1')).rejects.toThrow('up to 100')
  expect(await markAllNotificationsRead('u1', [])).toEqual([])
  expect(request).not.toHaveBeenCalled()
  request.mockResolvedValue(new Response('[]', { status: 200 }))
  await expect(markNotificationRead('n1')).rejects.toThrow('Refresh alerts')
})

it('requires a returned saved item ID to confirm removal', async () => {
  request.mockResolvedValueOnce(new Response('[{"id":"p1"}]', { status: 200 }))
  expect(await removeSavedItem('favorites', 'p1')).toEqual({ id: 'p1' })
  const [url, options] = request.mock.calls[0]
  expect(options.method).toBe('DELETE')
  expect(new URL(url).searchParams.get('id')).toBe('eq.p1')
  expect(new URL(url).searchParams.get('select')).toBe('id')
  request.mockResolvedValueOnce(new Response('[]', { status: 200 }))
  await expect(removeSavedItem('saved_events', 'e1')).rejects.toThrow('Refresh saved content')
})

it('refuses unrelated tables in the saved-item deletion helper', async () => {
  await expect(removeSavedItem('profiles', 'u1')).rejects.toThrow('Unsupported saved content type')
  expect(request).not.toHaveBeenCalled()
})

it.each([null, 'Original & note\nSecond line'])('conditionally updates notes originally equal to %s', async (original) => {
  request.mockResolvedValue(new Response(JSON.stringify([{ id: 's1', notes: null }]), { status: 200 }))
  await updateStopNotes('t1', { id: 's1', notes: original }, '')
  const [url, options] = request.mock.calls[0]
  const query = new URL(url).searchParams
  expect(query.get('id')).toBe('eq.s1')
  expect(query.get('itinerary_id')).toBe('eq.t1')
  expect(query.get('notes')).toBe(original === null ? 'is.null' : 'eq.' + original)
  expect(JSON.parse(options.body)).toEqual({ notes: null })
})

it('rejects stale note updates and oversized notes', async () => {
  await expect(updateStopNotes('t1', { id: 's1' }, 'x'.repeat(2001))).rejects.toThrow('2,000 characters')
  expect(request).not.toHaveBeenCalled()
  request.mockResolvedValue(new Response('[]', { status: 200 }))
  await expect(updateStopNotes('t1', { id: 's1' }, 'New notes')).rejects.toThrow('This stop changed')
})

it('sends a conditional PATCH with null-aware original dates and only editable fields', async () => {
  const saved = { id: 't1', name: 'Renamed', starts_on: null, ends_on: null }
  request.mockResolvedValue(new Response(JSON.stringify([saved]), { status: 200 }))
  expect(await updateItinerary({ id: 't1', name: 'Original', starts_on: '2026-10-10', ends_on: null }, {
    name: ' Renamed ', starts_on: '', ends_on: '', user_id: 'another-user', is_public: true,
  })).toEqual(saved)
  const [url, options] = request.mock.calls[0]
  const query = new URL(url).searchParams
  expect(query.get('id')).toBe('eq.t1')
  expect(query.get('name')).toBe('eq.Original')
  expect(query.get('starts_on')).toBe('eq.2026-10-10')
  expect(query.get('ends_on')).toBe('is.null')
  expect(options.method).toBe('PATCH')
  expect(JSON.parse(options.body)).toEqual({ name: 'Renamed', starts_on: null, ends_on: null, updated_at: expect.any(String) })
})

it('reports stale, deleted, or inaccessible rows instead of treating zero updates as success', async () => {
  request.mockResolvedValue(new Response('[]', { status: 200 }))
  await expect(updateItinerary({ id: 't1', name: 'Original' }, { name: 'Changed' })).rejects.toThrow('Reload before editing again')
})

it('preserves a database rejection', async () => {
  request.mockResolvedValue(new Response(JSON.stringify({ code: '23514', message: 'Invalid trip dates' }), { status: 400 }))
  await expect(updateItinerary({ id: 't1', name: 'Original' }, { name: 'Changed' })).rejects.toMatchObject({ code: '23514' })
})
