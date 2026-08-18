import { Link } from '@tanstack/react-router'

type RouteStubProps = {
  title: string
  description: string
  links?: Array<{ to: string; label: string }>
}

export function RouteStub({ title, description, links = [] }: RouteStubProps) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 p-6">
      <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
        TheDays
      </p>
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="text-neutral-600">{description}</p>
      <p className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
        Coming soon — foundation route stub.
      </p>
      {links.length > 0 ? (
        <nav className="flex flex-wrap gap-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-blue-600 underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </main>
  )
}
