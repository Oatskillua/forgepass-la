import { describe, expect, it } from 'vitest'

import {
  isValidEmail,
  sanitizeText,
  validateFeedbackPayload,
  validateWaitlistPayload,
} from './validation.js'

describe('API input validation', () => {
  it('normalizes waitlist fields and email casing', () => {
    expect(validateWaitlistPayload({
      name: '  Michael   Quarker ',
      email: ' USER@Example.COM ',
      city: ' Los   Angeles ',
      interest: ' Events ',
    })).toEqual({
      name: 'Michael Quarker',
      email: 'user@example.com',
      city: 'Los Angeles',
      interest: 'Events',
    })
  })

  it('caps untrusted text at the requested length', () => {
    expect(sanitizeText('abcdef', 4)).toBe('abcd')
  })

  it('distinguishes valid and invalid email addresses', () => {
    expect(isValidEmail('visitor@example.com')).toBe(true)
    expect(isValidEmail('visitor.example.com')).toBe(false)
  })

  it('normalizes feedback payloads', () => {
    const result = validateFeedbackPayload({
      name: ' Visitor ',
      email: 'VISITOR@EXAMPLE.COM',
      category: ' Product ',
      message: ' Useful   feedback ',
    })

    expect(result).toEqual({
      name: 'Visitor',
      email: 'visitor@example.com',
      category: 'Product',
      message: 'Useful feedback',
    })
  })
})
