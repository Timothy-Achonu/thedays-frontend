import { Link, createFileRoute } from '@tanstack/react-router'
import {
  useCurrentUserQuery,
  useLogoutMutation,
} from '@/lib/app/auth'
import { requireAuth } from '@/lib/auth/guards'
import { ROUTES } from '@/lib/constants/routes'
import { RouteStub } from '@/components/route-stub'
import { Button } from '@/components/ui'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => requireAuth(context.queryClient),
  component: DashboardPage,
})

function DashboardPage() {
  const { data: user } = useCurrentUserQuery()
  const logoutMutation = useLogoutMutation()

  return (
    <RouteStub
      title={user ? `Welcome, ${user.username}` : 'Dashboard'}
      description="Your TheDays trackers will appear here."
      links={[
        { to: ROUTES.trackers.new, label: 'Create TheDays' },
        { to: ROUTES.settings, label: 'Settings' },
      ]}
    >
      <div className="flex flex-col items-start gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          isLoading={logoutMutation.isPending}
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          Log out
        </Button>
        {logoutMutation.isError ? (
          <p className="text-sm text-neutral-600">
            Couldn't log out. Try again.
          </p>
        ) : null}
      </div>
    </RouteStub>
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
