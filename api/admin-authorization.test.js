import { describe, expect, it, vi } from 'vitest'
import metrics from './admin-metrics.js'
import waitlist from './admin-waitlist.js'
import feedback from './admin-feedback.js'
import exportWaitlist from './admin-export-waitlist.js'
import exportFeedback from './admin-export-feedback.js'
import feedbackStatus from './admin-feedback-status.js'

vi.mock('./_lib/adminAuth.js', () => ({ validateAdminAccess: vi.fn(async () => false) }))

describe('admin endpoint authorization boundary', () => {
  it.each([
    ['metrics', metrics], ['waitlist', waitlist], ['feedback', feedback],
    ['export waitlist', exportWaitlist], ['export feedback', exportFeedback],
    ['feedback status', feedbackStatus],
  ])('blocks %s before data access', async (_name, handler) => {
    const response = { setHeader: vi.fn(), status: vi.fn(), json: vi.fn() }
    response.status.mockReturnValue(response)
    await handler({ method: 'POST', headers: {}, body: {} }, response)
    expect(response.status).toHaveBeenCalledWith(401)
    expect(response.json).toHaveBeenCalledWith({ error: 'Unauthorized.' })
    expect(response.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store')
  })
})
