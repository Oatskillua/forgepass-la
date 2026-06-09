export function sanitizeText(value, maxLength = 500) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, maxLength)
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateWaitlistPayload(payload) {
  const name = sanitizeText(payload.name, 100)
  const email = sanitizeText(payload.email, 255).toLowerCase()
  const city = sanitizeText(payload.city, 100)
  const interest = sanitizeText(payload.interest, 50)

  return {
    name,
    email,
    city,
    interest,
  }
}

export function validateFeedbackPayload(payload) {
  const name = sanitizeText(payload.name, 100)
  const email = sanitizeText(payload.email, 255).toLowerCase()
  const category = sanitizeText(payload.category, 50)
  const message = sanitizeText(payload.message, 5000)

  return {
    name,
    email,
    category,
    message,
  }
}