/**
 * VITE_API_URL: backend origin (no `/api` path). Used for `getBackendBaseUrl()` and for Vite's dev proxy `target`.
 */
function normalizeBackendBase(raw: string | undefined): string {
  if (raw == null || raw === '') return ''
  return raw.replace(/\/+$/, '')
}

/** Raw backend base from env (no `/api` suffix). */
export function getBackendBaseUrl(): string {
  return normalizeBackendBase(import.meta.env.VITE_API_URL)
}

/**
 * Base URL for REST calls.
 *
 * - **Development:** `${origin}/api` so Vite proxies `/api/*` → backend (see `vite.config.ts`).
 * - **Production:** raw `VITE_API_URL` (no automatic `/api` segment).
 */
export function getBaseUrl(): string {
  if (import.meta.env.DEV) {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api`
    }
    return '/api'
  }
  return getBackendBaseUrl()
}
