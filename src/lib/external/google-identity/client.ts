import type {
  GoogleButtonConfiguration,
  GoogleCredentialResponse,
  GoogleIdentityApi,
  GoogleIdentityNamespace,
} from './types'

const GOOGLE_IDENTITY_SCRIPT_ID = 'google-identity-services-script'
const GOOGLE_IDENTITY_SCRIPT_URL = 'https://accounts.google.com/gsi/client'

type CredentialHandler = (response: GoogleCredentialResponse) => void

let activeCredentialHandler: CredentialHandler | null = null
let initializedClientId: string | null = null
let scriptPromise: Promise<GoogleIdentityApi> | null = null
const containerRenderOwners = new WeakMap<HTMLElement, symbol>()

function getGoogleIdentityApi() {
  const googleIdentityWindow = window as unknown as {
    google?: GoogleIdentityNamespace
  }

  return googleIdentityWindow.google?.accounts?.id
}

function waitForGoogleIdentityApi() {
  const identityApi = getGoogleIdentityApi()

  return identityApi
    ? Promise.resolve(identityApi)
    : Promise.reject(new Error('Google Identity Services did not initialize'))
}

export function loadGoogleIdentityScript() {
  const identityApi = getGoogleIdentityApi()
  if (identityApi) return Promise.resolve(identityApi)
  if (scriptPromise) return scriptPromise

  const loadPromise = new Promise<GoogleIdentityApi>((resolve, reject) => {
    const existingScript = document.getElementById(
      GOOGLE_IDENTITY_SCRIPT_ID,
    ) as HTMLScriptElement | null
    const script = existingScript ?? document.createElement('script')

    const handleLoad = () => {
      void waitForGoogleIdentityApi().then(resolve, reject)
    }
    const handleError = () => {
      reject(new Error('Failed to load Google Identity Services'))
    }

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })

    if (!existingScript) {
      script.id = GOOGLE_IDENTITY_SCRIPT_ID
      script.src = GOOGLE_IDENTITY_SCRIPT_URL
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  })

  scriptPromise = loadPromise
  void loadPromise.then(
    () => {
      if (scriptPromise === loadPromise) scriptPromise = null
    },
    () => {
      if (scriptPromise === loadPromise) scriptPromise = null
    },
  )

  return loadPromise
}

export async function renderGoogleIdentityButton({
  clientId,
  configuration,
  container,
  onCredential,
}: {
  clientId: string
  configuration: GoogleButtonConfiguration
  container: HTMLElement
  onCredential: CredentialHandler
}) {
  if (!clientId) throw new Error('Google sign-in is not configured')

  const identityApi = await loadGoogleIdentityScript()

  if (initializedClientId && initializedClientId !== clientId) {
    throw new Error(
      'Google Identity Services was initialized with another client ID',
    )
  }

  activeCredentialHandler = onCredential

  if (!initializedClientId) {
    identityApi.initialize({
      client_id: clientId,
      ux_mode: 'popup',
      callback: (response) => activeCredentialHandler?.(response),
    })
    initializedClientId = clientId
  }

  const renderOwner = Symbol('google-identity-button-render')
  containerRenderOwners.set(container, renderOwner)
  container.replaceChildren()
  identityApi.renderButton(container, configuration)

  return () => {
    if (activeCredentialHandler === onCredential) activeCredentialHandler = null

    if (containerRenderOwners.get(container) !== renderOwner) return

    containerRenderOwners.delete(container)
    container.replaceChildren()
  }
}
