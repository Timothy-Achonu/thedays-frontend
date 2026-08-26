import { AppDialog, Button } from '@/components/ui'

interface DeleteTrackerDialogProps {
  open: boolean
  trackerTitle: string
  daysCount: number
  isDeleting: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteTrackerDialog({
  open,
  trackerTitle,
  daysCount,
  isDeleting,
  error,
  onConfirm,
  onCancel,
}: DeleteTrackerDialogProps) {
  return (
    <AppDialog
      open={open}
      onClose={isDeleting ? () => undefined : onCancel}
      title={`Delete “${trackerTitle}”?`}
      description="This will permanently delete the tracker, its completed days, and its landmarks. This cannot be undone."
      size="sm"
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={isDeleting}>
            Keep it
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete forever'}
          </Button>
        </div>
      }
    >
      <div className="rounded-xl border border-dashed border-earth-300 bg-earth-50 px-4 py-3 text-sm text-earth-600">
        {daysCount === 1
          ? '1 completed day'
          : `${daysCount.toLocaleString()} completed days`}{' '}
        will be lost forever.
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-error-600">
          {error}
        </p>
      ) : null}
    </AppDialog>
  )
}
