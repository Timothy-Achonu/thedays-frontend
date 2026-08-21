export const SESSION_STATE_STORAGE_KEY = 'thedays:session-state'

export type SessionState = 'authenticated' | 'signed-out' | 'unknown'

export function getSessionState(): SessionState {
  if (typeof window === 'undefined') return 'unknown'

  try {
    const storedState = window.localStorage.getItem(SESSION_STATE_STORAGE_KEY)
    if (storedState === 'authenticated' || storedState === 'signed-out') {
      return storedState
    }
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }

  return 'unknown'
}

function setSessionState(state: Exclude<SessionState, 'unknown'>): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(SESSION_STATE_STORAGE_KEY, state)
  } catch {
    // The HttpOnly server session remains authoritative when storage fails.
  }
}

export function markSessionAuthenticated(): void {
  setSessionState('authenticated')
}

export function markSessionSignedOut(): void {
  setSessionState('signed-out')
}
