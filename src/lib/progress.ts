import type { TrackerData, ActivityType } from '../types'
import { getDaysInRange } from './dates'
import { parseISO } from 'date-fns'
import { ACTIVITY_META } from '../types'

export const PROGRESS_METRICS: {
  key: string
  type: ActivityType | 'sleep'
  label: string
  color: string
}[] = [
  { key: 'study', type: 'study', label: 'Study', color: ACTIVITY_META.study.color },
  { key: 'exercise', type: 'exercise', label: 'Exercise', color: ACTIVITY_META.exercise.color },
  { key: 'reading', type: 'reading', label: 'Reading', color: ACTIVITY_META.reading.color },
  { key: 'meditation', type: 'meditation', label: 'Meditation', color: ACTIVITY_META.meditation.color },
  { key: 'work', type: 'work', label: 'Work', color: ACTIVITY_META.work.color },
  { key: 'sleep', type: 'sleep', label: 'Sleep', color: '#a78bfa' },
]

export interface WeekProgressPoint {
  date: string
  dayLabel: string
  study: number
  exercise: number
  reading: number
  meditation: number
  work: number
  sleep: number
}

function activityMinutesForDay(
  data: TrackerData,
  type: ActivityType,
  date: string
): number {
  return data.activities
    .filter((a) => a.date === date && a.type === type)
    .reduce((sum, a) => sum + a.duration, 0)
}

export function getWeekProgressData(
  data: TrackerData,
  weekStart: string,
  weekEnd: string
): WeekProgressPoint[] {
  const days = getDaysInRange(parseISO(weekStart), parseISO(weekEnd))

  return days.map((date) => {
    const d = parseISO(date)
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
    const sleepMins = data.sleep.find((s) => s.date === date)?.duration ?? 0

    return {
      date,
      dayLabel,
      study: activityMinutesForDay(data, 'study', date),
      exercise: activityMinutesForDay(data, 'exercise', date),
      reading: activityMinutesForDay(data, 'reading', date),
      meditation: activityMinutesForDay(data, 'meditation', date),
      work: activityMinutesForDay(data, 'work', date),
      sleep: sleepMins,
    }
  })
}

export function weekHasProgressData(data: TrackerData, weekStart: string, weekEnd: string): boolean {
  return getWeekProgressData(data, weekStart, weekEnd).some(
    (p) => p.study + p.exercise + p.reading + p.meditation + p.work + p.sleep > 0
  )
}
