import { Link, createFileRoute } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants/routes'
import { RouteStub } from '@/components/route-stub'

export const Route = createFileRoute('/dashboard')({
  // TODO(phase-1): wire beforeLoad with GET /api/auth/me via TanStack Query
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <RouteStub
      title="Dashboard"
      description="Your TheDays trackers will appear here."
      links={[
        { to: ROUTES.trackers.new, label: 'Create TheDays' },
        { to: ROUTES.settings, label: 'Settings' },
        { to: ROUTES.login, label: 'Login' },
      ]}
    />
  )
}

export function ProtectedNav() {
  return (
    <nav className="flex gap-4 text-sm">
      <Link to={ROUTES.dashboard} className="text-blue-600 underline">
        Dashboard
      </Link>
      <Link to={ROUTES.settings} className="text-blue-600 underline">
        Settings
      </Link>
    </nav>
  )
}
