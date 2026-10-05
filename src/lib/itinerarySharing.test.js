import { beforeEach, expect, it, vi } from 'vitest'
import { getSharedItinerary, setItinerarySharing } from './itinerarySharing'
const rpc = vi.hoisted(() => vi.fn())
vi.mock('./supabase', () => ({ supabase: { rpc } }))
const token = '00000000-0000-0000-0000-000000000001'
beforeEach(() => vi.resetAllMocks())

it('does not request malformed links and reports missing or revoked trips', async () => {
  expect(await getSharedItinerary('invalid')).toBeNull()
  expect(rpc).not.toHaveBeenCalled()
  rpc.mockResolvedValue({ data: null })
  expect(await getSharedItinerary(token)).toBeNull()
  expect(rpc).toHaveBeenCalledWith('get_shared_itinerary', { token })
})

it('rejects malformed responses and propagates request failures', async () => {
  rpc.mockResolvedValueOnce({ data: { name: 'Trip', stops: [{ title: 'Stop', starts_at: 'broken' }] } })
    .mockResolvedValueOnce({ error: new Error('Offline') })
  await expect(getSharedItinerary(token)).rejects.toThrow('invalid')
  await expect(getSharedItinerary(token)).rejects.toThrow('Offline')
})

it('passes the original capability to the sharing update and requires a valid confirmation', async () => {
  const trip = { id: 't1', share_token: token }
  rpc.mockResolvedValueOnce({ data: { id: 't1', is_public: true, share_token: token } }).mockResolvedValueOnce({ data: {} })
  expect(await setItinerarySharing(trip, true)).toMatchObject({ is_public: true })
  expect(rpc).toHaveBeenCalledWith('set_itinerary_sharing', { target_id: 't1', expected_token: token, enabled: true })
  await expect(setItinerarySharing(trip, false)).rejects.toThrow('not confirmed')
})
