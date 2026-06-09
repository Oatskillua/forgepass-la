import { checkRateLimit, getClientIp } from './_lib/rateLimit.js'

const buckets = new Map()

export function checkRateLimit({
  key,
  limit = 5,
  windowMs = 60_000,
}) {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })

    return {
      allowed: true,
      remaining: limit - 1,
    }
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
    }
  }

  bucket.count += 1

  return {
    allowed: true,
    remaining: limit - bucket.count,
  }
}

export function getClientIp(request) {
  return (
    request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    request.headers['x-real-ip'] ||
    'unknown'
  )
}