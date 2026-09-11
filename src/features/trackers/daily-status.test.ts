import { describe, expect, it } from 'vitest'
import { getTrackerDailyStatus, resolveDayState } from './daily-status'

describe('Abstinence daily status', () => {
  it('resolves explicit bad days before good-date availability', () => {
    expect(
      resolveDayState('abstinence', '2026-08-24', '2026-08-24', false, true),
    ).toBe('bad')
  })

  it('shows bad today and yesterday on tracker summaries', () => {
    const status = getTrackerDailyStatus(
      { completionMode: 'abstinence', startDate: '2026-08-01' },
      new Set(),
      new Set(['2026-08-23', '2026-08-24']),
      '2026-08-24',
    )

    expect(status.lines).toEqual([
      { label: 'Today', value: 'Marked bad', tone: 'error' },
      { label: 'Yesterday', value: 'Marked bad', tone: 'error' },
    ])
  })
})
