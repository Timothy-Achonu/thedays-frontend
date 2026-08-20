import { GoogleIdentityButton } from './google-identity-button'
import { useGoogleLoginMutation } from '@/lib/app/auth'
import { getAuthErrorMessage, parseApiError } from '@/lib/utils'

type GoogleSignInProps = {
  disabled?: boolean
  onError: (message: string) => void
}

export function GoogleSignIn({ disabled = false, onError }: GoogleSignInProps) {
  const googleLoginMutation = useGoogleLoginMutation()

  return (
    <GoogleIdentityButton
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
      disabled={disabled || googleLoginMutation.isPending}
      onCredential={(idToken) => {
        googleLoginMutation.mutate(
          { idToken },
          {
            onError: (error) => {
              onError(getAuthErrorMessage(parseApiError(error).code))
            },
          },
        )
      }}
      onError={() => {
        onError(
          'Google sign-in could not be loaded. Please refresh and try again.',
        )
      }}
    />
  )
}
