import { Button, Logo } from '@/components/ui'
import { cn } from '@/lib/utils/cn'

type AuthenticatedGateProps =
  { state: 'loading' } | { state: 'error'; onRetry: () => void }

const dayMarkers = Array.from({ length: 7 }, (_, index) => index)

export function AuthenticatedGate(props: AuthenticatedGateProps) {
  const isLoading = props.state === 'loading'

  return (
    <main
      className="auth-gate relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-earth-950 px-6 py-12 text-center text-earth-50"
      aria-busy={isLoading}
    >
      <div className="auth-gate__glow auth-gate__glow--terracotta" />
      <div className="auth-gate__glow auth-gate__glow--sage" />
      <div className="auth-gate__grain" />

      <section
        className="relative z-10 flex w-full max-w-xl flex-col items-center"
        role={isLoading ? 'status' : 'alert'}
        aria-live={isLoading ? 'polite' : 'assertive'}
      >
        <p className="mb-9 text-[0.68rem] font-semibold uppercase tracking-[0.42em] text-sand-300/80">
          {isLoading ? 'TheDays' : 'A brief pause'}
        </p>

        <OrbitMark isLoading={isLoading} />

        <div className="mt-10 animate-fade-in-up">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-earth-50 sm:text-5xl">
            {isLoading ? 'Gathering your days' : 'Your days are still here.'}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-earth-300 sm:text-lg">
            {isLoading
              ? 'Bringing your progress back into focus.'
              : "We couldn't reach your account. Check your connection and try again."}
          </p>
        </div>

        {isLoading ? (
          <div
            className="auth-gate__progress mt-8 h-px w-36 overflow-hidden bg-earth-700"
            aria-hidden="true"
          >
            <span className="block h-full w-1/2 bg-gradient-to-r from-transparent via-terracotta-400 to-transparent" />
          </div>
        ) : (
          <Button
            type="button"
            size="lg"
            className="mt-8 min-w-36 shadow-[0_16px_45px_-18px_rgba(196,112,74,0.85)]"
            onClick={props.onRetry}
          >
            Try again
          </Button>
        )}
      </section>
    </main>
  )
}

function OrbitMark({ isLoading }: { isLoading: boolean }) {
  return (
    <div
      className={cn(
        'auth-gate__orbit relative grid size-56 place-items-center sm:size-64',
        !isLoading && 'auth-gate__orbit--paused',
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-full border border-earth-700/70" />
      <div className="absolute inset-5 rounded-full border border-dashed border-sage-500/25" />

      <svg
        className="auth-gate__arc absolute inset-0 size-full -rotate-90"
        viewBox="0 0 256 256"
      >
        <circle
          cx="128"
          cy="128"
          r="126"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="210 582"
        />
      </svg>

      <div className="auth-gate__day-ring absolute inset-0">
        {dayMarkers.map((day) => (
          <span
            key={day}
            className={cn(
              'auth-gate__day absolute left-1/2 top-1/2 size-2.5 rounded-full border border-earth-950 bg-earth-500 shadow-[0_0_0_4px_rgba(26,21,14,0.82)]',
              day < 4 && 'bg-terracotta-400',
              day === 4 && 'bg-sand-300',
            )}
            style={{
              transform: `translate(-50%, -50%) rotate(${day * (360 / dayMarkers.length)}deg) translateY(-7rem)`,
            }}
          />
        ))}
      </div>

      <div className="auth-gate__core relative grid size-24 place-items-center rounded-full border border-earth-200/15 bg-earth-50 shadow-[0_0_0_12px_rgba(250,248,245,0.035),0_24px_80px_-24px_rgba(196,112,74,0.85)] sm:size-28">
        <Logo variant="mark" size="xl" className="scale-110 sm:scale-125" />
        {!isLoading ? (
          <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-4 border-earth-950 bg-sand-300 font-display text-xl font-bold text-earth-900">
            !
          </span>
        ) : null}
      </div>
    </div>
  )
}
