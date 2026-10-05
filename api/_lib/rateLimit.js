export function createRateLimiter({ maxBuckets = 10000, clock = Date.now } = {}) {
  const buckets = new Map()
  let nextCleanup = 0
  return ({ key, limit = 5, windowMs = 60000 }) => {
    const now = clock()
    if (now >= nextCleanup) {
      for (const [storedKey, bucket] of buckets) {
        if (now >= bucket.resetAt) buckets.delete(storedKey)
      }
      nextCleanup = now + 1000
    }
    let bucket = buckets.get(key)
    if (bucket && now >= bucket.resetAt) { buckets.delete(key); bucket = null }
    if (!bucket) {
      // Do not evict active counters: doing so could reset an attacker's quota.
      if (buckets.size >= maxBuckets) return { allowed: false, remaining: 0, resetAt: nextCleanup }
      bucket = { count: 0, resetAt: now + windowMs }
      buckets.set(key, bucket)
    }
    if (bucket.count >= limit) return { allowed: false, remaining: 0, resetAt: bucket.resetAt }
    bucket.count += 1
    return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt }
  }
}

export const checkRateLimit = createRateLimiter()

export function getClientIp(request) {
  const forwarded = request.headers?.['x-forwarded-for']
  const real = request.headers?.['x-real-ip']
  const candidate = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') || (typeof real === 'string' ? real.trim() : '')
  return candidate && candidate.length <= 64 ? candidate : 'unknown'
}
