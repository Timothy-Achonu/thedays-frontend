import { describe, expect, it } from 'vitest'
import { getNewlyReachedLandmarks } from './newly-reached'

const landmarks = [
  { id: '10', targetCount: 10 },
  { id: '30', targetCount: 30 },
  { id: '50', targetCount: 50 },
]

describe('getNewlyReachedLandmarks', () => {
  it('returns the landmark whose target equals the new count', () => {
    expect(getNewlyReachedLandmarks(landmarks, 9, 10)).toEqual([
      { id: '10', targetCount: 10 },
    ])
  })

  it('returns every landmark jumped over by a bulk increase', () => {
    expect(getNewlyReachedLandmarks(landmarks, 0, 50)).toEqual(landmarks)
  })

  it('returns nothing when the landmark was already reached', () => {
    expect(getNewlyReachedLandmarks(landmarks, 50, 51)).toEqual([])
  })

  it('returns nothing when the count does not increase', () => {
    expect(getNewlyReachedLandmarks(landmarks, 10, 10)).toEqual([])
  })

  it('returns nothing when the count decreases', () => {
    expect(getNewlyReachedLandmarks(landmarks, 10, 9)).toEqual([])
  })
})
