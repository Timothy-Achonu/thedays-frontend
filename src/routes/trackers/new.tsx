import { createFileRoute } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants/routes'
import { RouteStub } from '@/components/route-stub'

export const Route = createFileRoute('/trackers/new')({
  // TODO(phase-1): wire beforeLoad with GET /api/auth/me via TanStack Query
  component: NewTrackerPage,
})

function NewTrackerPage() {
  return (
    <RouteStub
      title="Create TheDays"
      description="Define a title, start date, and completion mode for a new tracker."
      links={[{ to: ROUTES.dashboard, label: 'Back to dashboard' }]}
    />
  )
}
