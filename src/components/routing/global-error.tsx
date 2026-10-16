import { Link } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'

export function GlobalError({ error }: ErrorComponentProps) {
  const message =
    error instanceof Error ? error.message : 'Something went wrong.'

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Unexpected error</h1>
      <p className="max-w-md text-neutral-600">{message}</p>
      <Link to="/" className="text-blue-600 underline">
        Go home
      </Link>
    </main>
  )
}
