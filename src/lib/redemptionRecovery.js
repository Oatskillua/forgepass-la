const prefix = 'forgepass:redemption:v1:'

export function readPendingRedemption(userId) {
  const raw = localStorage.getItem(prefix + userId)
  if (!raw) return null
  const value = JSON.parse(raw)
  if (typeof value.requestKey !== 'string' || typeof value.rewardId !== 'string'
    || !Number.isInteger(value.cost) || value.cost < 0 || typeof value.title !== 'string') {
    throw new Error('The saved redemption needs review before another redemption can start.')
  }
  return value
}

export function savePendingRedemption(userId, value) {
  // Persist before sending the transaction. Storage failure must stop submission.
  localStorage.setItem(prefix + userId, JSON.stringify(value))
}

export function clearPendingRedemption(userId) {
  localStorage.removeItem(prefix + userId)
}
