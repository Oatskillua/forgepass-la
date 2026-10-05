export function localScheduleValue(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function scheduleTimestamp(value) {
  if (!value) return null
  const date = new Date(value)
  // Reject invalid dates and local times skipped by daylight-saving transitions.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) || !Number.isFinite(date.getTime()) || localScheduleValue(date) !== value) {
    throw new Error('Choose a valid local date and time. This time may be skipped by a clock change.')
  }
  return date.toISOString()
}

export function displaySchedule(timestamp) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'long' }).format(new Date(timestamp))
}
