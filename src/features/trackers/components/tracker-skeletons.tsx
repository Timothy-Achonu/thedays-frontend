import { cn } from '@/lib/utils/cn'

export function TrackerCardSkeleton({ index }: { index: number }) {
  return (
    <div
      aria-hidden="true"
      className="animate-fade-in-up rounded-2xl border border-earth-100 bg-white p-6 shadow-organic-sm"
      style={{
        animationDelay: `${Math.min(index, 8) * 60}ms`,
        animationFillMode: 'backwards',
      }}
    >
      <div className={cn(skeletonLine, 'h-5 w-3/4')} />
      <div className={cn(skeletonLine, 'mt-3 h-4 w-full')} />
      <div className={cn('mt-6 font-display', skeletonLine, 'h-10 w-24')} />
      <div className="mt-5 space-y-2 border-t border-dashed border-earth-200 pt-4">
        <div className={cn(skeletonLine, 'h-7 w-full rounded-lg')} />
        <div className={cn(skeletonLine, 'h-4 w-1/2')} />
      </div>
    </div>
  )
}

export function TrackersGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading your trackers"
      className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: count }, (_, index) => (
        <TrackerCardSkeleton key={index} index={index} />
      ))}
    </div>
  )
}

const skeletonLine =
  'animate-pulse-soft rounded-md bg-gradient-to-r from-earth-100 via-earth-200 to-earth-100'
