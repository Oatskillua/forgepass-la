import { supabase } from './supabase'

export async function getAccountSettings(userId) {
  const [profile, preferences] = await Promise.all([
    supabase.from('profiles').select('full_name, home_city').eq('id', userId).single(),
    supabase.from('notification_preferences').select('event_reminders, city_alerts, transportation, rewards, marketing').eq('user_id', userId).single(),
  ])
  if (profile.error || preferences.error) throw profile.error || preferences.error
  return { profile: profile.data, preferences: preferences.data }
}

export async function saveAccountSettings(profile, preferences) {
  const { error } = await supabase.rpc('save_account_settings', {
    new_full_name: profile.full_name, new_home_city: profile.home_city,
    new_event_reminders: preferences.event_reminders, new_city_alerts: preferences.city_alerts,
    new_transportation: preferences.transportation, new_rewards: preferences.rewards,
    new_marketing: preferences.marketing,
  })
  if (error) throw error
}

export async function getUserSummary(userId) {
  const [profile, favorites, savedEvents, itineraries] = await Promise.all([
    supabase.from('profiles').select('full_name, home_city').eq('id', userId).maybeSingle(),
    supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('saved_events').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('itineraries').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ])

  const error = [profile, favorites, savedEvents, itineraries].find((result) => result.error)?.error
  if (error) throw error
  if ([favorites, savedEvents, itineraries].some(({ count }) => !Number.isInteger(count) || count < 0)) {
    throw new Error('Account counts are unavailable. Please retry.')
  }

  return {
    profile: profile.data,
    favoriteCount: favorites.count,
    savedEventCount: savedEvents.count,
    itineraryCount: itineraries.count,
  }
}

export async function getSavedContent(userId) {
  const [favorites, events] = await Promise.all([
    supabase.from('favorites').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('saved_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ])

  if (favorites.error) throw favorites.error
  if (events.error) throw events.error
  return { favorites: favorites.data, events: events.data }
}

export async function removeSavedItem(table, id) {
  if (!['favorites', 'saved_events'].includes(table)) throw new Error('Unsupported saved content type.')
  const { data, error } = await supabase.from(table).delete().eq('id', id).select('id').maybeSingle()
  if (error) throw error
  if (!data) throw new Error('This saved item is no longer available. Refresh saved content before trying again.')
  return data
}

export async function saveEvent(userId, event) {
  const { error } = await supabase.from('saved_events').upsert({
    user_id: userId,
    event_external_id: event.id,
    event_name: event.name,
    event_snapshot: event,
  }, { onConflict: 'user_id,event_external_id' })

  if (error) throw error
}

export async function savePlace(userId, place) {
  const externalId = place.id || place.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const { error } = await supabase.from('favorites').upsert({
    user_id: userId,
    place_external_id: externalId,
    place_name: place.title,
    place_snapshot: place,
  }, { onConflict: 'user_id,place_external_id' })

  if (error) throw error
}

export async function getRewards(userId) {
  const [account, transactions, rewards] = await Promise.all([
    supabase.from('reward_accounts').select('*').eq('user_id', userId).single(),
    supabase.from('reward_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).order('id', { ascending: false }).limit(50),
    supabase.from('rewards').select('*').eq('active', true).order('points_cost'),
  ])

  const error = account.error || transactions.error || rewards.error
  if (error) throw error
  return { account: account.data, transactions: transactions.data, rewards: rewards.data }
}

export async function redeemReward(rewardId, expectedCost, requestKey) {
  const { data, error } = await supabase.rpc('redeem_reward', {
    target_reward: rewardId, expected_cost: expectedCost, request_key: requestKey,
  })
  if (error) throw error
  return data
}

export async function getRewardHistory(userId, before) {
  let query = supabase.from('reward_transactions').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false }).order('id', { ascending: false }).limit(50)
  if (before) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(before.id)
      || typeof before.created_at !== 'string' || !/^[0-9T:Z+.-]+$/.test(before.created_at)
      || !Number.isFinite(Date.parse(before.created_at))) throw new Error('Invalid history cursor. Show latest activity and try again.')
    query = query.or(`created_at.lt.${before.created_at},and(created_at.eq.${before.created_at},id.lt.${before.id})`)
  }
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getNotifications(userId, before) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(100)

  if (before) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(before.id)
      || typeof before.created_at !== 'string' || !/^[0-9T:Z+.-]+$/.test(before.created_at)
      || !Number.isFinite(Date.parse(before.created_at))) throw new Error('Unable to load older alerts. Refresh alerts and try again.')
    query = query.or(`created_at.lt.${before.created_at},and(created_at.eq.${before.created_at},id.lt.${before.id})`)
  }
  const { data, error } = await query

  if (error) throw error
  return data
}

export async function markNotificationRead(id) {
  const { data, error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id).select('id, read_at').maybeSingle()
  if (error) throw error
  if (!data) throw new Error('This alert is no longer available. Refresh alerts to check its status.')
  return data
}

export async function markAllNotificationsRead(userId, ids) {
  if (!Array.isArray(ids) || ids.length > 100) throw new Error('Choose up to 100 displayed alerts.')
  if (!ids.length) return []
  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .in('id', ids)
    .is('read_at', null)
    .select('id, read_at')
  if (error) throw error
  return data
}

export async function getItineraries(userId) {
  const { data, error } = await supabase
    .from('itineraries')
    .select('*, itinerary_items(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .order('position', { referencedTable: 'itinerary_items', ascending: true })
    .order('id', { referencedTable: 'itinerary_items', ascending: true })

  if (error) throw error
  return data
}

export async function createItinerary(userId, values) {
  const { data, error } = await supabase
    .from('itineraries')
    .insert({ user_id: userId, ...values })
    .select()
    .single()

  if (error) throw error
  return { ...data, itinerary_items: [] }
}

export async function deleteItinerary(id) {
  const { data, error } = await supabase.from('itineraries').delete().eq('id', id).select('id').maybeSingle()
  if (error) throw error
  if (!data) throw new Error('This itinerary is no longer available. Refresh itineraries to check its status.')
  return data
}

export async function updateItinerary(original, values) {
  let query = supabase.from('itineraries').update({
    name: values.name.trim(), starts_on: values.starts_on || null, ends_on: values.ends_on || null,
    updated_at: new Date().toISOString(),
  }).eq('id', original.id).eq('name', original.name)
  for (const field of ['starts_on', 'ends_on']) {
    query = original[field] == null ? query.is(field, null) : query.eq(field, original[field])
  }
  const { data, error } = await query.select().maybeSingle()
  if (error) throw error
  if (!data) throw new Error('This itinerary changed or is no longer available. Reload before editing again.')
  return data
}

export async function duplicateItinerary(id) {
  const { data, error } = await supabase.rpc('duplicate_itinerary', { source_id: id })
  if (error) throw error
  return data
}

export async function removeItineraryItem(id) {
  const { data, error } = await supabase.from('itinerary_items').delete().eq('id', id).select('id').single()
  if (error) throw error
  return data
}

export async function updateStopSchedule(tripId, original, startsAt) {
  if (startsAt !== null && (typeof startsAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(startsAt) || !Number.isFinite(Date.parse(startsAt)))) {
    throw new Error('Choose a valid stop date and time.')
  }
  let query = supabase.from('itinerary_items').update({ starts_at: startsAt })
    .eq('id', original.id).eq('itinerary_id', tripId)
  query = original.starts_at == null ? query.is('starts_at', null) : query.eq('starts_at', original.starts_at)
  const { data, error } = await query.select('id, starts_at').maybeSingle()
  if (error) throw error
  if (!data) throw new Error('This stop schedule changed or is no longer available. Refresh itineraries before editing again.')
  return data
}

export async function updateStopNotes(tripId, original, notes) {
  if (notes.length > 2000) throw new Error('Stop notes must be 2,000 characters or fewer.')
  let query = supabase.from('itinerary_items').update({ notes: notes || null })
    .eq('id', original.id).eq('itinerary_id', tripId)
  query = original.notes == null ? query.is('notes', null) : query.eq('notes', original.notes)
  const { data, error } = await query.select('id, notes').maybeSingle()
  if (error) throw error
  if (!data) throw new Error('This stop changed or is no longer available. Reload before editing again.')
  return data
}

export async function reorderItineraryStops(itineraryId, previousIds, nextIds) {
  const { error } = await supabase.rpc('reorder_itinerary_stops', {
    target_itinerary: itineraryId, expected_order: previousIds, desired_order: nextIds,
  })
  if (error) throw error
}

export async function addItineraryItem(itineraryId, title, position, source = {}) {
  const { data, error } = await supabase
    .from('itinerary_items')
    .insert({ itinerary_id: itineraryId, item_type: source.item_type || 'custom', title, position,
      external_id: source.external_id || null, location_snapshot: source.snapshot || {} })
    .select()
    .single()

  if (error) throw error
  return data
}
