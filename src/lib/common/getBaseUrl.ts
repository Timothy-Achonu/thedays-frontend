/**
 * VITE_API_URL: backend origin (no `/api` path). Used for `getBackendBaseUrl()` and for Vite's dev proxy `target`.
 */
function normalizeBackendBase(raw: string | undefined): string {
  if (raw == null || raw === '') return ''
  return raw.replace(/\/+$/, '')
}

/** Ensure the REST base includes `/api` without doubling it. */
function withApiPrefix(origin: string): string {
  if (!origin) return '/api'
  if (origin === '/api' || origin.endsWith('/api')) return origin
  return `${origin}/api`
}

/** Raw backend base from env (no `/api` suffix). */
export function getBackendBaseUrl(): string {
  return normalizeBackendBase(import.meta.env.VITE_API_URL)
}

/**
 * Base URL for REST calls. Always includes the `/api` prefix the backend mounts on.
 *
 * - **Development:** `${origin}/api` so Vite proxies `/api/*` → backend (see `vite.config.ts`).
 * - **Production:** `${VITE_API_URL}/api`. Does not append a second `/api` if the origin already ends with it.
 */
export function getBaseUrl(): string {
  if (import.meta.env.DEV) {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api`
    }
    return '/api'
  }
  return withApiPrefix(getBackendBaseUrl())
}
