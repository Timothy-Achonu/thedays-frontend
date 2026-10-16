import { useEffect, useRef, useState } from 'react'
import { renderGoogleIdentityButton } from '@/lib/external/google-identity/client'

type GoogleIdentityButtonProps = {
  clientId?: string
  disabled?: boolean
  onCredential: (idToken: string) => void
  onError: (error: unknown) => void
}

export function GoogleIdentityButton({
  clientId,
  disabled = false,
  onCredential,
  onError,
}: GoogleIdentityButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onCredentialRef = useRef(onCredential)
  const onErrorRef = useRef(onError)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  onCredentialRef.current = onCredential
  onErrorRef.current = onError

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let cleanupButton: (() => void) | undefined
    const width = Math.min(container.clientWidth || 400, 400)

    setIsLoading(true)
    setLoadError(null)

    void renderGoogleIdentityButton({
      clientId: clientId ?? '',
      container,
      configuration: {
        logo_alignment: 'left',
        shape: 'rectangular',
        size: 'large',
        text: 'continue_with',
        theme: 'outline',
        type: 'standard',
        width,
      },
      onCredential: (response) => {
        if (!response.credential) {
          const error = new Error(
            'Google did not return an authentication token',
          )
          setLoadError('Google sign-in did not return an authentication token.')
          onErrorRef.current(error)
          return
        }

        onCredentialRef.current(response.credential)
      },
    })
      .then((cleanup) => {
        if (cancelled) cleanup()
        else cleanupButton = cleanup
      })
      .catch((error: unknown) => {
        if (cancelled) return
        console.error('Google Identity Services initialization failed', error)
        setLoadError(
          'Google sign-in could not be loaded. Please refresh and try again.',
        )
        onErrorRef.current(error)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
      cleanupButton?.()
    }
  }, [clientId])

  return (
    <div aria-busy={isLoading || disabled}>
      <div
        ref={containerRef}
        className={
          disabled
            ? 'pointer-events-none flex w-full justify-center opacity-60'
            : 'flex w-full justify-center'
        }
      />
      {isLoading ? (
        <p className="mt-2 text-center text-xs text-earth-500">
          Loading Google sign-in…
        </p>
      ) : null}
      {loadError ? (
        <p className="mt-2 text-center text-xs text-error-700" role="alert">
          {loadError}
        </p>
      ) : null}
    </div>
  )
}
