import { supabase } from './supabase'
const validToken = (token) => typeof token === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)

export async function setItinerarySharing(trip, enabled) {
  const { data, error } = await supabase.rpc('set_itinerary_sharing', { target_id: trip.id, expected_token: trip.share_token, enabled })
  if (error) throw error
  if (!data || data.id !== trip.id || data.is_public !== enabled || !validToken(data.share_token)) throw new Error('Sharing was not confirmed. Refresh itineraries to check its status.')
  return data
}

export async function getSharedItinerary(token) {
  if (!validToken(token)) return null
  const { data, error } = await supabase.rpc('get_shared_itinerary', { token })
  if (error) throw error
  if (data !== null && (!data || typeof data.name !== 'string' || !Array.isArray(data.stops) || data.stops.some((stop) => !stop || typeof stop.title !== 'string' || (stop.starts_at !== null && (typeof stop.starts_at !== 'string' || !Number.isFinite(Date.parse(stop.starts_at))))))) {
    throw new Error('The shared itinerary response was invalid. Try refreshing.')
  }
  return data
}
