import type {
  TrackerData,
  DaySummary,
  PeriodStats,
  Period,
  ActivityType,
} from '../types'
import { getDateRange, getDaysInRange, formatDate } from './dates'

function sumByType(activities: TrackerData['activities'], type: ActivityType, date: string) {
  return activities
    .filter((a) => a.date === date && a.type === type)
    .reduce((sum, a) => sum + a.duration, 0)
}

export function getDaySummary(data: TrackerData, date: string): DaySummary {
  const dayActivities = data.activities.filter((a) => a.date === date)
  const checklist = data.dailyChecklists.find((c) => c.date === date)
  const completed = checklist?.items.filter((i) => i.completed).length ?? 0
  const total = data.checklistTemplates.length

  return {
    date,
    studyMinutes: sumByType(data.activities, 'study', date),
    sleepMinutes: data.sleep.find((s) => s.date === date)?.duration ?? 0,
    exerciseMinutes: sumByType(data.activities, 'exercise', date),
    readingMinutes: sumByType(data.activities, 'reading', date),
    totalActiveMinutes: dayActivities.reduce((s, a) => s + a.duration, 0),
    checklistCompleted: completed,
    checklistTotal: total,
    activities: dayActivities,
  }
}

export function getPeriodStats(
  data: TrackerData,
  period: Period,
  refDate = new Date()
): PeriodStats {
  const { start, end, label } = getDateRange(period, refDate)
  const days = getDaysInRange(start, end)

  let studyMinutes = 0
  let sleepMinutes = 0
  let exerciseMinutes = 0
  let readingMinutes = 0
  let totalActive = 0
  let sleepQualitySum = 0
  let sleepCount = 0
  let checklistCompleted = 0
  let checklistTotal = 0
  let daysTracked = 0

  for (const date of days) {
    const summary = getDaySummary(data, date)
    const hasData =
      summary.activities.length > 0 ||
      summary.sleepMinutes > 0 ||
      summary.checklistCompleted > 0

    if (hasData) daysTracked++
    studyMinutes += summary.studyMinutes
    sleepMinutes += summary.sleepMinutes
    exerciseMinutes += summary.exerciseMinutes
    readingMinutes += summary.readingMinutes
    totalActive += summary.totalActiveMinutes
    checklistCompleted += summary.checklistCompleted
    checklistTotal += summary.checklistTotal

    const sleep = data.sleep.find((s) => s.date === date)
    if (sleep) {
      sleepQualitySum += sleep.quality
      sleepCount++
    }
  }

  return {
    label,
    studyHours: studyMinutes / 60,
    sleepHours: sleepMinutes / 60,
    exerciseMinutes,
    readingMinutes,
    avgSleepQuality: sleepCount > 0 ? sleepQualitySum / sleepCount : 0,
    checklistRate: checklistTotal > 0 ? (checklistCompleted / checklistTotal) * 100 : 0,
    totalActiveHours: totalActive / 60,
    daysTracked,
  }
}

export function getChartData(
  data: TrackerData,
  period: Period,
  refDate = new Date()
) {
  const { start, end } = getDateRange(period, refDate)
  const days = getDaysInRange(start, end)

  return days.map((date) => {
    const summary = getDaySummary(data, date)
    return {
      date,
      label:
        period === 'year'
          ? formatDate(date, 'MMM')
          : period === 'month'
            ? formatDate(date, 'd')
            : formatDate(date, 'EEE'),
      study: +(summary.studyMinutes / 60).toFixed(1),
      sleep: +(summary.sleepMinutes / 60).toFixed(1),
      exercise: summary.exerciseMinutes,
      reading: summary.readingMinutes,
      checklist: summary.checklistTotal
        ? Math.round((summary.checklistCompleted / summary.checklistTotal) * 100)
        : 0,
      total: +(summary.totalActiveMinutes / 60).toFixed(1),
    }
  })
}

export function getActivityDistribution(data: TrackerData, period: Period, refDate = new Date()) {
  const { start, end } = getDateRange(period, refDate)
  const days = getDaysInRange(start, end)
  const totals: Record<string, number> = {}

  for (const activity of data.activities) {
    if (days.includes(activity.date)) {
      const key = activity.label || activity.type
      totals[key] = (totals[key] ?? 0) + activity.duration
    }
  }

  return Object.entries(totals)
    .map(([name, value]) => ({ name, value: +(value / 60).toFixed(1) }))
    .sort((a, b) => b.value - a.value)
}

export function getSleepQualityData(data: TrackerData, period: Period, refDate = new Date()) {
  const { start, end } = getDateRange(period, refDate)
  const days = getDaysInRange(start, end)

  return days
    .map((date) => {
      const entry = data.sleep.find((s) => s.date === date)
      return {
        date,
        label: formatDate(date, period === 'year' ? 'MMM' : 'EEE'),
        quality: entry?.quality ?? 0,
        hours: entry ? +(entry.duration / 60).toFixed(1) : 0,
      }
    })
    .filter((d) => d.quality > 0 || d.hours > 0)
}
