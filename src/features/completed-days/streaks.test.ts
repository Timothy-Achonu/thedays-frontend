import { describe, expect, it } from 'vitest'
import { getCompletionStreaks, isPerfectClosedMonth } from './streaks'

describe('getCompletionStreaks', () => {
  it('returns no streaks when there are no completed dates', () => {
    expect(
      getCompletionStreaks({
        completedDates: [],
        completionMode: 'practice',
        startDate: '2026-08-01',
        today: '2026-08-05',
      }),
    ).toEqual({ streaks: [], currentStreak: null })
  })

  it('excludes isolated completed days from historical streaks', () => {
    const result = getCompletionStreaks({
      completedDates: ['2026-08-03'],
      completionMode: 'practice',
      startDate: '2026-08-01',
      today: '2026-08-05',
    })

    expect(result.streaks).toEqual([])
    expect(result.currentStreak).toBeNull()
  })

  it('groups separated consecutive runs', () => {
    const result = getCompletionStreaks({
      completedDates: [
        '2026-08-01',
        '2026-08-02',
        '2026-08-04',
        '2026-08-05',
        '2026-08-06',
      ],
      completionMode: 'practice',
      startDate: '2026-08-01',
      today: '2026-08-07',
    })

    expect(result.streaks).toEqual([
      { startDate: '2026-08-01', endDate: '2026-08-02', dayCount: 2 },
      { startDate: '2026-08-04', endDate: '2026-08-06', dayCount: 3 },
    ])
    expect(result.currentStreak).toBeNull()
  })

  it('finds a practice current streak ending today', () => {
    const result = getCompletionStreaks({
      completedDates: ['2026-08-03', '2026-08-04', '2026-08-05'],
      completionMode: 'practice',
      startDate: '2026-08-01',
      today: '2026-08-05',
    })

    expect(result.currentStreak).toEqual({
      startDate: '2026-08-03',
      endDate: '2026-08-05',
      dayCount: 3,
    })
  })

  it('finds an abstinence current streak ending yesterday', () => {
    const result = getCompletionStreaks({
      completedDates: ['2026-08-03', '2026-08-04', '2026-08-05'],
      completionMode: 'abstinence',
      startDate: '2026-08-01',
      today: '2026-08-06',
    })

    expect(result.currentStreak).toEqual({
      startDate: '2026-08-03',
      endDate: '2026-08-05',
      dayCount: 3,
    })
  })

  it('handles streaks across month boundaries', () => {
    const result = getCompletionStreaks({
      completedDates: ['2026-01-31', '2026-02-01'],
      completionMode: 'practice',
      startDate: '2026-01-01',
      today: '2026-02-02',
    })

    expect(result.streaks).toEqual([
      { startDate: '2026-01-31', endDate: '2026-02-01', dayCount: 2 },
    ])
  })
})

describe('isPerfectClosedMonth', () => {
  it('detects a complete closed month', () => {
    expect(
      isPerfectClosedMonth({
        completedDates: new Set(['2026-08-01', '2026-08-02']),
        completionMode: 'practice',
        monthKey: '2026-08',
        startDate: '2026-08-01',
        today: '2026-09-01',
      }),
    ).toBe(false)

    expect(
      isPerfectClosedMonth({
        completedDates: new Set(
          Array.from({ length: 31 }, (_, index) => {
            const day = `${index + 1}`.padStart(2, '0')
            return `2026-08-${day}`
          }),
        ),
        completionMode: 'practice',
        monthKey: '2026-08',
        startDate: '2026-08-01',
        today: '2026-09-01',
      }),
    ).toBe(true)
  })

  it('supports a tracker that starts mid-month', () => {
    expect(
      isPerfectClosedMonth({
        completedDates: new Set([
          '2026-08-29',
          '2026-08-30',
          '2026-08-31',
        ]),
        completionMode: 'practice',
        monthKey: '2026-08',
        startDate: '2026-08-29',
        today: '2026-09-01',
      }),
    ).toBe(true)
  })

  it('does not decorate the current month even when elapsed days are checked', () => {
    expect(
      isPerfectClosedMonth({
        completedDates: new Set(['2026-08-01', '2026-08-02']),
        completionMode: 'practice',
        monthKey: '2026-08',
        startDate: '2026-08-01',
        today: '2026-08-02',
      }),
    ).toBe(false)
  })

  it('uses yesterday as the abstinence eligibility boundary', () => {
    expect(
      isPerfectClosedMonth({
        completedDates: new Set(['2026-08-30', '2026-08-31']),
        completionMode: 'abstinence',
        monthKey: '2026-08',
        startDate: '2026-08-30',
        today: '2026-09-01',
      }),
    ).toBe(true)
  })
})
