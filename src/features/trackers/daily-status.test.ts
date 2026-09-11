import { describe, expect, it } from 'vitest'
import { getTrackerDailyStatus, resolveDayState } from './daily-status'

describe('Abstinence daily status', () => {
  it('resolves explicit bad days before good-date availability', () => {
    expect(
      resolveDayState('abstinence', '2026-08-24', '2026-08-24', false, true),
    ).toBe('bad')
  })

  it('keeps exact Abstinence outcomes private on tracker summaries', () => {
    const status = getTrackerDailyStatus(
      { completionMode: 'abstinence', startDate: '2026-08-01' },
      new Set(),
      new Set(['2026-08-23', '2026-08-24']),
      '2026-08-24',
    )

    expect(status.lines).toEqual([
      { label: 'Check-in', value: 'Up to date', tone: 'earth' },
    ])
  })

  it('prompts for an unreviewed finished day without exposing today', () => {
    const status = getTrackerDailyStatus(
      { completionMode: 'abstinence', startDate: '2026-08-01' },
      new Set(),
      new Set(),
      '2026-08-24',
    )

    expect(status.lines).toEqual([
      { label: 'Check-in', value: 'Ready to review', tone: 'sand' },
    ])
  })
})
