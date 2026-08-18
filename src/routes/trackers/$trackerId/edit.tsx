import { createFileRoute } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants/routes'
import { RouteStub } from '@/components/route-stub'

export const Route = createFileRoute('/trackers/$trackerId/edit')({
  // TODO(phase-1): wire beforeLoad with GET /api/auth/me via TanStack Query
  component: EditTrackerPage,
})

function EditTrackerPage() {
  const { trackerId } = Route.useParams()

  return (
    <RouteStub
      title={`Edit tracker ${trackerId}`}
      description="Update title, description, or start date. Completion mode cannot be changed."
      links={[
        { to: ROUTES.trackers.detail(trackerId), label: 'View tracker' },
        { to: ROUTES.dashboard, label: 'Back to dashboard' },
      ]}
    />
  )
}
