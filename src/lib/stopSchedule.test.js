// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { localScheduleValue, scheduleTimestamp } from './stopSchedule'

describe('stop schedule time conversion', () => {
  it('round trips local time and allows clearing', () => {
    expect(localScheduleValue(scheduleTimestamp('2026-10-10T11:30'))).toBe('2026-10-10T11:30')
    expect(scheduleTimestamp('')).toBeNull()
    expect(() => scheduleTimestamp('2026-02-30T12:00')).toThrow('valid local')
    expect(() => scheduleTimestamp('invalid')).toThrow('valid local')
  })
})
