import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { dateStringToSafeDate, safeDateToDateString } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

interface CalendarProps {
  /** Selected date as `YYYY-MM-DD`, or undefined for no selection. */
  value?: string
  onSelect: (date: string) => void
  /**
   * "Today" in the user's profile timezone. The browser clock must not decide
   * what counts as today, so callers pass this explicitly.
   */
  today: string
  /** Dates after this `YYYY-MM-DD` value are disabled. */
  disabledAfter?: string
  className?: string
}

const MIN_YEAR = 1970

export function Calendar({
  value,
  onSelect,
  today,
  disabledAfter,
  className,
}: CalendarProps) {
  const selectedDate = value ? dateStringToSafeDate(value) : undefined
  const todayDate = dateStringToSafeDate(today)
  const endMonth = disabledAfter
    ? dateStringToSafeDate(disabledAfter)
    : undefined

  return (
    <div className={cn('thedays-calendar rounded-2xl bg-white p-2', className)}>
      <DayPicker
        mode="single"
        animate={false}
        selected={selectedDate}
        onSelect={(date) => {
          if (date) {
            onSelect(safeDateToDateString(date))
          }
        }}
        today={todayDate}
        defaultMonth={selectedDate ?? todayDate}
        startMonth={new Date(MIN_YEAR, 0)}
        endMonth={endMonth}
        disabled={(date) =>
          disabledAfter ? safeDateToDateString(date) > disabledAfter : false
        }
        showOutsideDays={false}
        weekStartsOn={1}
      />
    </div>
  )
}
