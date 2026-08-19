import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/guards'
import { ROUTES } from '@/lib/constants/routes'
import { RouteStub } from '@/components/route-stub'

export const Route = createFileRoute('/trackers/new')({
  beforeLoad: ({ context }) => requireAuth(context.queryClient),
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
