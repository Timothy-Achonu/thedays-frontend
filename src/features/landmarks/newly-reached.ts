/**
 * Landmarks whose target was crossed by a count increase from
 * `previousCount` to `nextCount`. Unmarks and no-ops return an empty list.
 */
export function getNewlyReachedLandmarks<T extends { targetCount: number }>(
  landmarks: ReadonlyArray<T>,
  previousCount: number,
  nextCount: number,
): Array<T> {
  if (nextCount <= previousCount) return []

  return landmarks.filter(
    (landmark) =>
      previousCount < landmark.targetCount && nextCount >= landmark.targetCount,
  )
}
