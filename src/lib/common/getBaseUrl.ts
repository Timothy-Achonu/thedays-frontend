/**
 * Browser-facing base URL for REST calls.
 *
 * Vite proxies `/api/*` to the configured development backend. In production,
 * Vercel rewrites the same relative path to Render so session cookies remain
 * first-party from the browser's perspective.
 */
export function getBaseUrl(): string {
  return '/api'
}
