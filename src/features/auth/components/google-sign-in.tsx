import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { GoogleIdentityButton } from './google-identity-button'
import { useGoogleLoginMutation } from '@/lib/app/auth'
import { ROUTES } from '@/lib/constants/routes'
import { getAuthErrorMessage, parseApiError } from '@/lib/utils'

type GoogleSignInProps = {
  disabled?: boolean
  timezone?: string
  onError: (message: string) => void
}

export function GoogleSignIn({
  disabled = false,
  timezone,
  onError,
}: GoogleSignInProps) {
  const googleLoginMutation = useGoogleLoginMutation()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <GoogleIdentityButton
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
      disabled={disabled || isSubmitting || googleLoginMutation.isPending}
      onCredential={(idToken) => {
        void (async () => {
          setIsSubmitting(true)
          try {
            await googleLoginMutation.mutateAsync({
              idToken,
              ...(timezone ? { timezone } : {}),
            })
            await navigate({ to: ROUTES.dashboard })
          } catch (error) {
            setIsSubmitting(false)
            onError(getAuthErrorMessage(parseApiError(error).code))
          }
        })()
      }}
      onError={() => {
        onError(
          'Google sign-in could not be loaded. Please refresh and try again.',
        )
      }}
    />
  )
}
