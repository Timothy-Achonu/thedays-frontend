import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/guards'
import { ROUTES } from '@/lib/constants/routes'
import { RouteStub } from '@/components/route-stub'

export const Route = createFileRoute('/trackers/$trackerId/')({
  beforeLoad: ({ context }) => requireAuth(context.queryClient),
  component: TrackerDetailPage,
})

function TrackerDetailPage() {
  const { trackerId } = Route.useParams()

  return (
    <RouteStub
      title={`Tracker ${trackerId}`}
      description="View elapsed days, mark completions, and track landmarks."
      links={[
        {
          to: ROUTES.trackers.edit(trackerId),
          label: 'Edit tracker',
        },
        { to: ROUTES.dashboard, label: 'Back to dashboard' },
      ]}
    />
  )
}
