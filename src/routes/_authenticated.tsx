import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/layouts'
import { requireAuth } from '@/lib/auth/guards'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: requireAuth,
  component: AuthenticatedLayout,
})
