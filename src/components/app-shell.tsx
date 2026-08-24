import { Link } from '@tanstack/react-router'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import type { ComponentType, ReactNode } from 'react'
import type { User } from '@/lib/common/models'
import { useLogoutMutation } from '@/lib/app/auth'
import { ROUTES } from '@/lib/constants/routes'
import { Logo } from '@/components/ui'
import { cn } from '@/lib/utils/cn'

type AppShellProps = {
  user: User
  children: ReactNode
}

type NavigationItem = {
  label: string
  to: string
  icon: ComponentType<{ className?: string }>
}

const navigationItems: Array<NavigationItem> = [
  { label: 'Home', to: ROUTES.dashboard, icon: HomeIcon },
  { label: 'New Tracker', to: ROUTES.trackers.new, icon: PlusIcon },
  { label: 'Settings', to: ROUTES.settings, icon: SettingsIcon },
]

export function AppShell({ user, children }: AppShellProps) {
  const logoutMutation = useLogoutMutation()
  const initials = getInitials(user.username)

  return (
    <div className="min-h-dvh bg-earth-50 md:flex md:h-dvh md:overflow-hidden">
      <aside className="hidden h-dvh min-h-0 w-60 shrink-0 flex-col overflow-hidden bg-earth-950 px-4 py-5 text-earth-100 lg:flex">
        <div className="px-3">
          <Logo variant="full" size="md" className="[&_span]:text-earth-50" />
        </div>

        <p className="mt-12 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-earth-500">
          Your space
        </p>
        <nav
          aria-label="Main navigation"
          className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain"
        >
          {navigationItems.map((item) => (
            <DesktopNavigationLink key={item.to} item={item} />
          ))}
        </nav>

        <AccountBlock
          initials={initials}
          username={user.username}
          onLogout={() => logoutMutation.mutate()}
          isLoggingOut={logoutMutation.isPending}
          hasLogoutError={logoutMutation.isError}
        />
      </aside>

      <aside className="hidden h-dvh min-h-0 w-[4.5rem] shrink-0 flex-col items-center overflow-hidden border-r border-earth-200 bg-earth-950 py-5 text-earth-100 md:flex lg:hidden">
        <Logo variant="mark" size="md" className="[&_svg]:rounded-full" />
        <nav aria-label="Main navigation" className="mt-12 flex flex-col gap-3">
          {navigationItems.map((item) => (
            <TabletNavigationLink key={item.to} item={item} />
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 pb-24 md:flex md:min-h-0 md:flex-col md:overflow-hidden md:pb-0">
        <div className="relative z-40 border-b border-earth-100 bg-earth-50/90 px-5 py-4 backdrop-blur md:px-8 lg:hidden">
          <div className="flex items-center justify-between">
            <Logo size="sm" />
            <ResponsiveAccountMenu
              initials={initials}
              username={user.username}
              onLogout={() => logoutMutation.mutate()}
              isLoggingOut={logoutMutation.isPending}
              hasLogoutError={logoutMutation.isError}
            />
          </div>
        </div>
        <div
          id="main-scroll"
          className="min-h-[calc(100dvh-4.5rem)] md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-contain"
        >
          {children}
        </div>
      </div>

      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-earth-200/80 bg-earth-50/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgb(45_36_25_/_0.08)] backdrop-blur md:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
          {navigationItems.map((item) => (
            <MobileNavigationLink key={item.to} item={item} />
          ))}
        </div>
      </nav>
    </div>
  )
}

function ResponsiveAccountMenu({
  initials,
  username,
  onLogout,
  isLoggingOut,
  hasLogoutError,
}: {
  initials: string
  username: string
  onLogout: () => void
  isLoggingOut: boolean
  hasLogoutError: boolean
}) {
  return (
    <Popover className="relative">
      <PopoverButton
        aria-label={`Open account menu for ${username}`}
        className="grid size-10 place-items-center rounded-full bg-sage-100 text-sm font-semibold text-sage-700 transition-colors hover:bg-sage-200 focus-ring data-[open]:bg-sage-200"
      >
        {initials}
      </PopoverButton>

      <PopoverPanel
        transition
        role="dialog"
        aria-label="Account menu"
        className="absolute right-0 z-40 mt-3 w-[min(18rem,calc(100vw-2.5rem))] origin-top-right rounded-2xl border border-earth-200/80 bg-white p-2 shadow-organic-lg transition duration-150 ease-out data-[closed]:translate-y-1 data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        <div className="flex items-center gap-3 rounded-xl bg-earth-50 px-3 py-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-sage-700 text-sm font-semibold text-sage-50">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-earth-900">
              {username}
            </p>
            <p className="text-xs text-earth-500">Your account</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-earth-600 transition-colors hover:bg-earth-100 hover:text-earth-900 focus-ring disabled:cursor-wait disabled:opacity-60"
        >
          <LogOutIcon className="size-5" />
          {isLoggingOut ? 'Signing out…' : 'Log out'}
        </button>
        {hasLogoutError ? (
          <p role="alert" className="px-3 pb-2 pt-1 text-xs text-error-700">
            Couldn&apos;t log out. Try again.
          </p>
        ) : null}
      </PopoverPanel>
    </Popover>
  )
}

function DesktopNavigationLink({ item }: { item: NavigationItem }) {
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.to !== ROUTES.dashboard }}
      className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-earth-400 transition-colors hover:bg-earth-900 hover:text-earth-100 focus-ring"
      activeProps={{ className: 'bg-earth-800 text-earth-50 shadow-inner' }}
    >
      <Icon className="size-5 shrink-0" />
      <span>{item.label}</span>
    </Link>
  )
}

function TabletNavigationLink({ item }: { item: NavigationItem }) {
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      aria-label={item.label}
      title={item.label}
      activeOptions={{ exact: item.to !== ROUTES.dashboard }}
      className="grid size-11 place-items-center rounded-xl text-earth-500 transition-colors hover:bg-earth-900 hover:text-earth-100 focus-ring"
      activeProps={{ className: 'bg-earth-800 text-terracotta-300' }}
    >
      <Icon className="size-5" />
    </Link>
  )
}

function MobileNavigationLink({ item }: { item: NavigationItem }) {
  const Icon = item.icon
  const isCreate = item.to === ROUTES.trackers.new
  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.to !== ROUTES.dashboard }}
      className={cn(
        'flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[0.68rem] font-semibold transition-colors focus-ring',
        isCreate
          ? 'text-terracotta-600 hover:bg-terracotta-50'
          : 'text-earth-500 hover:bg-earth-100 hover:text-earth-800',
      )}
      activeProps={{ className: 'bg-earth-100 text-earth-900' }}
    >
      <Icon className={cn('size-5', isCreate && 'size-6')} />
      <span>{isCreate ? 'New Tracker' : item.label}</span>
    </Link>
  )
}

function AccountBlock({
  initials,
  username,
  onLogout,
  isLoggingOut,
  hasLogoutError,
}: {
  initials: string
  username: string
  onLogout: () => void
  isLoggingOut: boolean
  hasLogoutError: boolean
}) {
  return (
    <div className="border-t border-earth-800 pt-4">
      <div className="flex items-center gap-3 px-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-sage-700 text-sm font-semibold text-sage-50">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-earth-100">
            {username}
          </p>
          <p className="text-xs text-earth-500">Your account</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-earth-500 transition-colors hover:bg-earth-900 hover:text-earth-100 focus-ring disabled:cursor-wait disabled:opacity-60"
      >
        <LogOutIcon className="size-5" />
        {isLoggingOut ? 'Signing out…' : 'Log out'}
      </button>
      {hasLogoutError ? (
        <p role="alert" className="mt-2 px-3 text-xs text-terracotta-300">
          Couldn&apos;t log out. Try again.
        </p>
      ) : null}
    </div>
  )
}

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase()
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <IconBase
      className={className}
      path="M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9 20v-6h6v6"
    />
  )
}

function PlusIcon({ className }: { className?: string }) {
  return <IconBase className={className} path="M12 5v14M5 12h14" />
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <IconBase
      className={className}
      path="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0-5v2m0 13v2M3.5 12h2m13 0h2M5.9 5.9l1.4 1.4m9.4 9.4 1.4 1.4m0-12.2-1.4 1.4m-9.4 9.4-1.4 1.4"
    />
  )
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className} path="M10 5H5v14h5m5-4 4-3-4-3m4 3H9" />
  )
}

function IconBase({ className, path }: { className?: string; path: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
