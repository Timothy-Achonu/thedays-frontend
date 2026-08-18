import { cn } from '@/lib/utils/cn'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'mark'
  className?: string
}

const sizeStyles = {
  sm: { text: 'text-xl', icon: 'w-6 h-6' },
  md: { text: 'text-2xl', icon: 'w-8 h-8' },
  lg: { text: 'text-3xl', icon: 'w-10 h-10' },
  xl: { text: 'text-4xl', icon: 'w-12 h-12' },
}

export function Logo({ size = 'md', variant = 'full', className }: LogoProps) {
  const styles = sizeStyles[size]

  if (variant === 'mark') {
    return (
      <div className={cn('inline-flex', className)}>
        <LogoMark className={styles.icon} />
      </div>
    )
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark className={styles.icon} />
      <span
        className={cn(
          'font-display font-semibold text-earth-900 tracking-tight',
          styles.text,
        )}
      >
        TheDays
      </span>
    </div>
  )
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Organic layered circles representing cumulative progress */}
      <defs>
        <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c4704a" />
          <stop offset="100%" stopColor="#a85a3a" />
        </linearGradient>
        <linearGradient id="logoGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c9a82" />
          <stop offset="100%" stopColor="#5e7d64" />
        </linearGradient>
      </defs>

      {/* Background organic shape */}
      <circle cx="24" cy="24" r="22" fill="#faf8f5" />

      {/* Stacked progress rings - representing accumulated days */}
      <circle
        cx="24"
        cy="24"
        r="18"
        fill="none"
        stroke="#e8dfd2"
        strokeWidth="2.5"
      />

      {/* Progress arc 1 - sage accent */}
      <path
        d="M24 6 A18 18 0 0 1 42 24"
        fill="none"
        stroke="url(#logoGradient2)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Progress arc 2 - terracotta main */}
      <path
        d="M42 24 A18 18 0 0 1 24 42"
        fill="none"
        stroke="url(#logoGradient1)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Progress arc 3 - continuing progress */}
      <path
        d="M24 42 A18 18 0 0 1 9 33"
        fill="none"
        stroke="url(#logoGradient2)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Center dot - today's completion */}
      <circle cx="24" cy="24" r="5" fill="url(#logoGradient1)" />

      {/* Small accent dots representing individual days */}
      <circle cx="24" cy="10" r="2" fill="#c4704a" />
      <circle cx="38" cy="24" r="2" fill="#7c9a82" />
      <circle cx="24" cy="38" r="2" fill="#c4704a" />
      <circle cx="12" cy="30" r="1.5" fill="#7c9a82" opacity="0.6" />
    </svg>
  )
}

export function LogoIcon({ className }: { className?: string }) {
  return <LogoMark className={className} />
}
