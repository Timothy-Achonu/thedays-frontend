import { createFileRoute } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants/routes'
import { RouteStub } from '@/components/route-stub'

export const Route = createFileRoute('/settings')({
  // TODO(phase-1): wire beforeLoad with GET /api/auth/me via TanStack Query
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <RouteStub
      title="Settings"
      description="Manage your account and timezone preferences."
      links={[{ to: ROUTES.dashboard, label: 'Back to dashboard' }]}
    />
  )
}
