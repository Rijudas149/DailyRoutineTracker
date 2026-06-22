import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  subDays,
  isToday,
  isSameDay,
  differenceInMinutes,
} from 'date-fns'
import type { Period } from '../types'

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatDate(dateStr: string, fmt = 'MMM d, yyyy'): string {
  return format(parseISO(dateStr), fmt)
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function formatHours(minutes: number): string {
  return `${(minutes / 60).toFixed(1)}h`
}

export function getDateRange(period: Period, referenceDate = new Date()) {
  switch (period) {
    case 'day':
      return {
        start: referenceDate,
        end: referenceDate,
        label: format(referenceDate, 'EEEE, MMM d'),
      }
    case 'week':
      return {
        start: startOfWeek(referenceDate, { weekStartsOn: 1 }),
        end: endOfWeek(referenceDate, { weekStartsOn: 1 }),
        label: `Week of ${format(startOfWeek(referenceDate, { weekStartsOn: 1 }), 'MMM d')}`,
      }
    case 'month':
      return {
        start: startOfMonth(referenceDate),
        end: endOfMonth(referenceDate),
        label: format(referenceDate, 'MMMM yyyy'),
      }
    case 'year':
      return {
        start: startOfYear(referenceDate),
        end: endOfYear(referenceDate),
        label: format(referenceDate, 'yyyy'),
      }
  }
}

export function getDaysInRange(start: Date, end: Date): string[] {
  return eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'))
}

export function getLastNDays(n: number): string[] {
  const today = new Date()
  return Array.from({ length: n }, (_, i) =>
    format(subDays(today, n - 1 - i), 'yyyy-MM-dd')
  )
}

export interface WeekOption {
  id: string
  start: string
  end: string
  label: string
}

/** List of Mon–Sun weeks for dropdown (newest first). */
export function getWeekOptions(count = 16, referenceDate = new Date()): WeekOption[] {
  const weeks: WeekOption[] = []
  let cursor = startOfWeek(referenceDate, { weekStartsOn: 1 })

  for (let i = 0; i < count; i++) {
    const start = cursor
    const end = endOfWeek(cursor, { weekStartsOn: 1 })
    const startStr = format(start, 'yyyy-MM-dd')
    const endStr = format(end, 'yyyy-MM-dd')
    weeks.push({
      id: startStr,
      start: startStr,
      end: endStr,
      label: `${format(start, 'do MMM')} – ${format(end, 'do MMM, yyyy')}`,
    })
    cursor = subDays(start, 7)
  }
  return weeks
}

export function calcSleepDuration(bedtime: string, wakeTime: string): number {
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  let bed = bh * 60 + bm
  let wake = wh * 60 + wm
  if (wake <= bed) wake += 24 * 60
  return wake - bed
}

export { isToday, isSameDay, differenceInMinutes, format, parseISO }
