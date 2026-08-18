export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  settings: '/settings',
  trackers: {
    new: '/trackers/new',
    detail: (trackerId: string) => `/trackers/${trackerId}`,
    edit: (trackerId: string) => `/trackers/${trackerId}/edit`,
  },
} as const
