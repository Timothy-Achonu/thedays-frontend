export type GoogleCredentialResponse = {
  credential?: string
  select_by?: string
}

export type GoogleButtonConfiguration = {
  logo_alignment?: 'center' | 'left'
  shape?: 'circle' | 'pill' | 'rectangular' | 'square'
  size?: 'large' | 'medium' | 'small'
  text?: 'continue_with' | 'signin' | 'signin_with' | 'signup_with'
  theme?: 'filled_black' | 'filled_blue' | 'outline'
  type?: 'icon' | 'standard'
  width?: number
}

export type GoogleIdentityApi = {
  initialize: (configuration: {
    callback: (response: GoogleCredentialResponse) => void
    client_id: string
    ux_mode?: 'popup' | 'redirect'
  }) => void
  renderButton: (
    container: HTMLElement,
    configuration: GoogleButtonConfiguration,
  ) => void
}

export type GoogleIdentityNamespace = {
  accounts?: {
    id?: GoogleIdentityApi
  }
}
