import {Link, createFileRoute, } from '@tanstack/react-router'
import { Button, Logo } from '@/components/ui'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils/cn'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="min-h-dvh bg-earth-50 overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <Link to={ROUTES.login}>
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to={ROUTES.register} className="hidden sm:block">
              <Button variant="primary" size="sm">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        {/* Background Decorations */}
        <HeroBackground />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 sm:pt-20 sm:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-terracotta-100 text-terracotta-700 text-sm font-medium mb-8 animate-fade-in-down">
              <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse-soft" />
              Track progress, not perfection
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-semibold text-earth-900 tracking-tight leading-[1.1] animate-fade-in-up">
              Every day counts.
              <br />
              <span className="text-terracotta-500">No resets.</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-earth-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
              Build habits without the anxiety of streaks. When you miss a day,
              your progress stays intact. Every completed day adds to your total
              forever.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3">
              <Link to={ROUTES.register}>
                <Button size="lg" className="min-w-[200px]">
                  Start tracking free
                </Button>
              </Link>
              <Link to={ROUTES.login}>
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  I have an account
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="mt-16 sm:mt-20 animate-fade-in-up stagger-4">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="relative py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-earth-900 tracking-tight">
              Progress that grows with you
            </h2>
            <p className="mt-4 text-lg text-earth-600">
              Unlike streak-based apps, TheDays celebrates what you've achieved,
              not what you might lose.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {valueProps.map((prop, index) => (
              <ValuePropCard key={prop.title} {...prop} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 sm:py-32 bg-sand-50 texture-noise">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-earth-900 tracking-tight">
              Simple, rewarding tracking
            </h2>
            <p className="mt-4 text-lg text-earth-600">
              Create trackers for habits you want to build or behaviors you want
              to change.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <ExampleTracker />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-br from-terracotta-500 to-terracotta-600 texture-noise overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-sage-400/20 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-white tracking-tight">
            Start counting your days
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            Join thousands of people building better habits without the stress
            of maintaining streaks.
          </p>
          <div className="mt-10">
            <Link to={ROUTES.register}>
              <Button
                size="lg"
                className="bg-white text-terracotta-600 hover:bg-earth-50 shadow-lg min-w-[200px]"
              >
                Get started for free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-earth-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo
            size="sm"
            className="[&_span]:text-earth-300 [&_svg_circle:first-child]:fill-earth-800"
          />
          <p className="text-earth-500 text-sm">
            Every day counts. No resets.
          </p>
        </div>
      </footer>
    </div>
  )
}

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-terracotta-200/40 via-terracotta-100/20 to-transparent rounded-full blur-3xl translate-x-1/3 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-sage-200/30 via-sage-100/15 to-transparent rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />

      {/* Subtle grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.015]">
        <defs>
          <pattern
            id="grid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-earth-900"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}

function HeroIllustration() {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const completedDays = [true, true, false, true, true, false, true]
  const count = completedDays.filter(Boolean).length

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-organic-lg p-6 sm:p-8 border border-earth-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-display font-semibold text-earth-900">
              Days I Went Running
            </h3>
            <p className="text-sm text-earth-500 mt-1">Practice mode</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-display font-bold text-terracotta-500">
              {count}
            </p>
            <p className="text-sm text-earth-500">days</p>
          </div>
        </div>

        {/* Week grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {weekDays.map((day, index) => (
            <div key={day} className="text-center">
              <p className="text-xs text-earth-500 mb-2">{day}</p>
              <div
                className={cn(
                  'aspect-square rounded-xl flex items-center justify-center transition-all duration-300',
                  completedDays[index]
                    ? 'bg-terracotta-500 text-white shadow-sm'
                    : 'bg-earth-100 text-earth-400 border-2 border-dashed border-earth-200',
                )}
              >
                {completedDays[index] ? (
                  <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <span className="text-lg sm:text-xl font-light">—</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Message */}
        <div className="mt-6 pt-6 border-t border-earth-100">
          <p className="text-earth-600 text-center">
            <span className="text-sage-600 font-medium">Wed & Sat missed?</span>{' '}
            No problem—you still have{' '}
            <span className="text-terracotta-600 font-semibold">
              {count} days
            </span>{' '}
            of progress.
          </p>
        </div>
      </div>
    </div>
  )
}

const valueProps = [
  {
    icon: '🌱',
    title: 'Cumulative Progress',
    description:
      'Every completed day adds to your total. Missing a day means zero progress for that day—not losing what you built.',
  },
  {
    icon: '🎯',
    title: 'Personal Landmarks',
    description:
      'Set milestones at 10, 30, 100 days and plan how you\'ll celebrate. Watch your progress grow toward each goal.',
  },
  {
    icon: '✨',
    title: 'Two Tracking Modes',
    description:
      'Practice mode for habits you want to do. Abstinence mode for things you want to avoid. Both count progress, not streaks.',
  },
]

function ValuePropCard({
  icon,
  title,
  description,
  index,
}: {
  icon: string
  title: string
  description: string
  index: number
}) {
  return (
    <div
      className="group p-6 sm:p-8 rounded-2xl bg-earth-50 hover:bg-white border border-transparent hover:border-earth-100 hover:shadow-organic-md transition-all duration-300"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="w-14 h-14 rounded-2xl bg-terracotta-100 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-display font-semibold text-earth-900 mb-3">
        {title}
      </h3>
      <p className="text-earth-600 leading-relaxed">{description}</p>
    </div>
  )
}

function ExampleTracker() {
  return (
    <div className="bg-white rounded-2xl shadow-organic-md p-6 sm:p-8 border border-earth-100">
      <div className="flex items-start gap-6">
        {/* Progress Ring */}
        <div className="hidden sm:flex shrink-0 w-24 h-24 relative">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e8dfd2"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#c4704a"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(37 / 50) * 283} 283`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-display font-bold text-terracotta-600">
              37
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-2xl font-display font-semibold text-earth-900">
            Days Without Soda
          </h3>
          <p className="text-earth-500 mt-1">Abstinence mode • Started Aug 1</p>

          {/* Landmark Progress */}
          <div className="mt-6 p-4 rounded-xl bg-sage-50 border border-sage-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sage-700 font-medium">Next Landmark</span>
              <span className="text-sage-600 text-sm">50 days</span>
            </div>
            <div className="h-2 bg-sage-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sage-500 rounded-full transition-all duration-500"
                style={{ width: '74%' }}
              />
            </div>
            <p className="mt-2 text-sm text-sage-600">
              13 more days until: <em>Buy a new pair of headphones</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
