import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import type { Landmark } from '@/types/trackers'
import { AppDialog, Button, Input, Textarea } from '@/components/ui'
import { getFieldError, getFormError, parseApiError } from '@/lib/utils'

const TITLE_MAX = 120
const CELEBRATION_MAX = 500
const TARGET_MAX = 100_000

export interface LandmarkFormPayload {
  title: string
  targetCount: number
  celebrationDescription: string
}

interface LandmarkFormDialogProps {
  open: boolean
  /** When set the dialog edits this landmark; otherwise it creates a new one. */
  landmark?: Landmark | null
  isPending: boolean
  currentCount: number
  onSubmit: (payload: LandmarkFormPayload) => Promise<unknown>
  onClose: () => void
}

export function LandmarkFormDialog({
  open,
  landmark,
  isPending,
  currentCount,
  onSubmit,
  onClose,
}: LandmarkFormDialogProps) {
  const isEditing = Boolean(landmark)
  const formId = useId()
  const [title, setTitle] = useState('')
  const [targetCount, setTargetCount] = useState('')
  const [celebrationDescription, setCelebrationDescription] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string
    targetCount?: string
    celebrationDescription?: string
  }>({})
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setTitle(landmark?.title ?? '')
      setTargetCount(landmark ? String(landmark.targetCount) : '')
      setCelebrationDescription(landmark?.celebrationDescription ?? '')
      setFieldErrors({})
      setFormError(null)
    }
  }, [open, landmark])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const errors: typeof fieldErrors = {}
    const trimmedTitle = title.trim()
    const parsedTarget = Number(targetCount)

    if (trimmedTitle.length > TITLE_MAX) {
      errors.title = `Titles are limited to ${TITLE_MAX} characters.`
    }
    if (!targetCount.trim() || !Number.isInteger(parsedTarget)) {
      errors.targetCount = 'Enter a whole number of days.'
    } else if (parsedTarget < 1 || parsedTarget > TARGET_MAX) {
      errors.targetCount = `Targets are between 1 and ${TARGET_MAX.toLocaleString()} days.`
    }
    if (!celebrationDescription.trim()) {
      errors.celebrationDescription =
        'How will you celebrate? This field is required.'
    } else if (celebrationDescription.trim().length > CELEBRATION_MAX) {
      errors.celebrationDescription = `Celebrations are limited to ${CELEBRATION_MAX} characters.`
    }

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      await onSubmit({
        title: trimmedTitle,
        targetCount: parsedTarget,
        celebrationDescription: celebrationDescription.trim(),
      })
      onClose()
    } catch (submitError) {
      const parsed = parseApiError(submitError)
      setFieldErrors({
        title: getFieldError(parsed, 'title'),
        targetCount: getFieldError(parsed, 'targetCount'),
        celebrationDescription: getFieldError(parsed, 'celebrationDescription'),
      })
      setFormError(
        getFormError(parsed) ??
          'The landmark could not be saved. Please try again.',
      )
    }
  }

  return (
    <AppDialog
      open={open}
      onClose={isPending ? () => undefined : onClose}
      title={
        isEditing
          ? `Edit ${landmark?.title || `${landmark?.targetCount}-day landmark`}`
          : 'Add a landmark'
      }
      description="A landmark is a target worth reaching — and a promise of how you will celebrate."
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form={formId} isLoading={isPending}>
            {isEditing ? 'Save landmark' : 'Add landmark'}
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        <Input
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={fieldErrors.title}
          placeholder="The Big 50"
          hint={`Optional. Up to ${TITLE_MAX} characters.`}
          maxLength={TITLE_MAX + 1}
          disabled={isPending}
        />

        {Number.isInteger(Number(targetCount)) &&
        Number(targetCount) <= currentCount ? (
          <p
            role="status"
            className="rounded-xl border border-sand-300 bg-sand-100 px-4 py-3 text-sm leading-5 text-sand-900"
          >
            This is a historical milestone and will be recorded as already
            reached.
          </p>
        ) : null}

        <Input
          label="Target"
          type="number"
          required
          min={1}
          max={TARGET_MAX}
          step={1}
          inputMode="numeric"
          value={targetCount}
          onChange={(event) => setTargetCount(event.target.value)}
          error={fieldErrors.targetCount}
          placeholder="50"
          hint="Completed days needed to reach this landmark."
          disabled={isPending}
        />

        <Textarea
          label="Celebration"
          required
          value={celebrationDescription}
          onChange={(event) => setCelebrationDescription(event.target.value)}
          error={fieldErrors.celebrationDescription}
          placeholder="Buy a new pair of running shoes and go out for dinner."
          hint={`Up to ${CELEBRATION_MAX} characters.`}
          maxLength={CELEBRATION_MAX + 1}
          disabled={isPending}
        />

        {formError ? (
          <p role="alert" className="text-sm text-error-600">
            {formError}
          </p>
        ) : null}
      </form>
    </AppDialog>
  )
}

interface DeleteLandmarkDialogProps {
  landmark: Landmark | null
  isPending: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteLandmarkDialog({
  landmark,
  isPending,
  error,
  onConfirm,
  onCancel,
}: DeleteLandmarkDialogProps) {
  return (
    <AppDialog
      open={landmark !== null}
      onClose={isPending ? () => undefined : onCancel}
      title={`Delete ${landmark?.title || 'the'} ${
        landmark ? `${landmark.targetCount.toLocaleString()}-day` : ''
      } landmark?`}
      description="Your completed days are not affected — only this landmark and its celebration note will be removed."
      size="sm"
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={isPending}>
            Keep it
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isPending}>
            {isPending ? 'Deleting…' : 'Delete landmark'}
          </Button>
        </div>
      }
    >
      {error ? (
        <p role="alert" className="text-sm text-error-600">
          {error}
        </p>
      ) : null}
    </AppDialog>
  )
}
