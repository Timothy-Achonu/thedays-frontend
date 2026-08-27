export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
  settings: '/settings',
  trackers: {
    index: '/trackers',
    new: '/trackers/new',
    detail: (trackerId: string) => `/trackers/${trackerId}`,
    edit: (trackerId: string) => `/trackers/${trackerId}/edit`,
  },
} as const
