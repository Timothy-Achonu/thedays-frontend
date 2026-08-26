import { describe, expect, it } from 'vitest'
import { formatLandmarkReachedToast } from './landmark-reached-toast'

describe('formatLandmarkReachedToast', () => {
  it('names a titled landmark and uses the celebration as the subtitle', () => {
    expect(
      formatLandmarkReachedToast([
        {
          title: 'Running shoes',
          targetCount: 50,
          celebrationDescription: 'Buy a new pair of running shoes.',
        },
      ]),
    ).toEqual({
      title: '50 days — Running shoes',
      subtitle: 'Buy a new pair of running shoes.',
    })
  })

  it('falls back when the landmark has no title', () => {
    expect(
      formatLandmarkReachedToast([
        {
          title: null,
          targetCount: 10,
          celebrationDescription: 'Celebrate with dinner.',
        },
      ]),
    ).toEqual({
      title: '10-day landmark reached',
      subtitle: 'Celebrate with dinner.',
    })
  })

  it('collapses several landmarks into one title and compact list', () => {
    expect(
      formatLandmarkReachedToast([
        {
          title: 'Dinner',
          targetCount: 10,
          celebrationDescription: 'Celebrate with dinner.',
        },
        {
          title: null,
          targetCount: 50,
          celebrationDescription: 'Buy new shoes.',
        },
      ]),
    ).toEqual({
      title: '2 landmarks reached',
      subtitle: '10 days: Dinner. 50 days: Buy new shoes.',
    })
  })
})
