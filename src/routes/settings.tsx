import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/guards'
import { ROUTES } from '@/lib/constants/routes'
import { RouteStub } from '@/components/route-stub'

export const Route = createFileRoute('/settings')({
  beforeLoad: ({ context }) => requireAuth(context.queryClient),
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
