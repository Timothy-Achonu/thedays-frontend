import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-neutral-600">
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="text-blue-600 underline">
        Go home
      </Link>
    </main>
  )
}
