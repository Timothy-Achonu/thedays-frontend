import { createFileRoute } from '@tanstack/react-router'
import { useCurrentUserQuery } from '@/lib/app/auth'
import { ROUTES } from '@/lib/constants/routes'
import { RouteStub } from '@/components/route-stub'
import { TimezoneMismatchBanner } from '@/components/timezone-mismatch-banner'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: user } = useCurrentUserQuery()

  return (
    <RouteStub
      title={user ? `Welcome, ${user.username}` : 'Dashboard'}
      description="Your TheDays trackers will appear here."
      links={[
        { to: ROUTES.trackers.new, label: 'Create Days Tracker' },
        { to: ROUTES.settings, label: 'Settings' },
      ]}
    >
      <div className="flex flex-col items-start gap-2">
        {user ? <TimezoneMismatchBanner user={user} /> : null}
      </div>
    </RouteStub>
  )
}
