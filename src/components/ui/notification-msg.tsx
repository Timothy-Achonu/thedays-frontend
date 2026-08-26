interface NotificationMsgProps {
  message?: string
  subtitle?: string
  tone?: 'success' | 'error' | 'warning'
}

export function NotificationMsg({
  message,
  subtitle,
  tone = 'success',
}: NotificationMsgProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col pr-2">
      {message ? (
        <p
          className={
            tone === 'error'
              ? 'font-display text-base font-semibold text-error-700'
              : tone === 'warning'
                ? 'font-display text-base font-semibold text-earth-900'
                : 'font-display text-base font-semibold text-earth-900'
          }
        >
          {message}
        </p>
      ) : null}
      {subtitle ? (
        <p className="mt-0.5 text-sm leading-6 text-earth-600">{subtitle}</p>
      ) : null}
    </div>
  )
}
