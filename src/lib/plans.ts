import {
  format,
  parseISO,
  startOfWeek,
  startOfMonth,
  addDays,
} from 'date-fns'
import type {
  TrackerData,
  PlanEntry,
  DeficitCarryForward,
  ActivityType,
  PlanScope,
} from '../types'
import { getDateRange, getDaysInRange, formatDate } from './dates'

export type TrackableType = ActivityType | 'sleep'

export const PLAN_TYPES: TrackableType[] = [
  'study',
  'exercise',
  'reading',
  'meditation',
  'work',
  'sleep',
]

export const DEFICIT_THRESHOLD = 0.6

export interface PlanTargetKey {
  type: TrackableType
  customLabel?: string
}

function normalizeLabel(label?: string): string {
  return (label ?? '').trim().toLowerCase()
}

function planKey(type: TrackableType, customLabel?: string): string {
  if (type === 'custom') return `custom:${normalizeLabel(customLabel)}`
  return type
}

function plansMatch(
  a: PlanEntry,
  type: TrackableType,
  customLabel?: string
): boolean {
  if (a.type !== type) return false
  if (type === 'custom') {
    return normalizeLabel(a.customLabel) === normalizeLabel(customLabel)
  }
  return true
}

export function getScopeStartDate(scope: PlanScope, dateStr: string): string {
  const d = parseISO(dateStr)
  if (scope === 'day' || scope === 'custom_date' || scope === 'custom_period') return dateStr
  if (scope === 'week') return format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  return format(startOfMonth(d), 'yyyy-MM-dd')
}

export function planAppliesToDate(plan: PlanEntry, refDate: string): boolean {
  if (plan.scope === 'custom_date') return plan.startDate === refDate
  if (plan.scope === 'custom_period') {
    return !!plan.endDate && refDate >= plan.startDate && refDate <= plan.endDate
  }
  const scopeKey = getScopeStartDate(plan.scope, refDate)
  return plan.startDate === scopeKey
}

export function getPlan(
  data: TrackerData,
  type: TrackableType,
  scope: PlanScope,
  refDate: string,
  customLabel?: string,
  endDate?: string
): PlanEntry | undefined {
  if (scope === 'custom_date') {
    return data.plans.find(
      (p) =>
        p.scope === 'custom_date' &&
        p.startDate === refDate &&
        plansMatch(p, type, customLabel)
    )
  }
  if (scope === 'custom_period') {
    return data.plans.find(
      (p) =>
        p.scope === 'custom_period' &&
        p.startDate === refDate &&
        p.endDate === endDate &&
        plansMatch(p, type, customLabel)
    )
  }
  const key = getScopeStartDate(scope, refDate)
  return data.plans.find(
    (p) => p.scope === scope && p.startDate === key && plansMatch(p, type, customLabel)
  )
}

export function getAchievedMinutes(
  data: TrackerData,
  type: TrackableType,
  date: string,
  customLabel?: string
): number {
  if (type === 'sleep') {
    return data.sleep.find((s) => s.date === date)?.duration ?? 0
  }
  if (type === 'custom' && customLabel) {
    const norm = normalizeLabel(customLabel)
    return data.activities
      .filter(
        (a) =>
          a.date === date &&
          a.type === 'custom' &&
          normalizeLabel(a.label) === norm
      )
      .reduce((sum, a) => sum + a.duration, 0)
  }
  return data.activities
    .filter((a) => a.date === date && a.type === type)
    .reduce((sum, a) => sum + a.duration, 0)
}

export function getAchievedInScope(
  data: TrackerData,
  type: TrackableType,
  scope: PlanScope,
  refDate: string,
  customLabel?: string,
  endDate?: string
): number {
  if (scope === 'custom_date') {
    return getAchievedMinutes(data, type, refDate, customLabel)
  }
  if (scope === 'custom_period' && endDate) {
    const days = getDaysInRange(parseISO(refDate), parseISO(endDate))
    return days.reduce(
      (sum, d) => sum + getAchievedMinutes(data, type, d, customLabel),
      0
    )
  }
  const period =
    scope === 'week' ? 'week' : scope === 'month' ? 'month' : 'day'
  const { start, end } = getDateRange(period, parseISO(refDate))
  const days = getDaysInRange(start, end)
  return days.reduce(
    (sum, d) => sum + getAchievedMinutes(data, type, d, customLabel),
    0
  )
}

export function getDailyPortion(plan: PlanEntry, refDate: string): number {
  if (plan.scope === 'day' || plan.scope === 'custom_date') return plan.targetMinutes
  if (plan.scope === 'custom_period' && plan.endDate) {
    const days = getDaysInRange(parseISO(plan.startDate), parseISO(plan.endDate)).length
    return days > 0 ? Math.round(plan.targetMinutes / days) : plan.targetMinutes
  }
  const period = plan.scope === 'week' ? 'week' : 'month'
  const { start, end } = getDateRange(period, parseISO(refDate))
  const days = getDaysInRange(start, end).length
  return Math.round(plan.targetMinutes / days)
}

export function getCarryForwardExtra(
  data: TrackerData,
  type: TrackableType,
  date: string,
  customLabel?: string
): number {
  return data.carryForwards
    .filter(
      (cf) =>
        cf.type === type &&
        normalizeLabel(cf.customLabel) === normalizeLabel(customLabel) &&
        cf.remainingMinutes > 0 &&
        date >= cf.startSpreadDate &&
        date <= cf.endSpreadDate
    )
    .reduce((sum, cf) => sum + cf.extraPerDay, 0)
}

export function getEffectiveDailyTarget(
  data: TrackerData,
  type: TrackableType,
  refDate: string,
  customLabel?: string
): { base: number; extra: number; total: number; plan?: PlanEntry } {
  const dayPlan = getPlan(data, type, 'day', refDate, customLabel)
  const customDatePlan = getPlan(data, type, 'custom_date', refDate, customLabel)
  const weekPlan = getPlan(data, type, 'week', refDate, customLabel)
  const monthPlan = getPlan(data, type, 'month', refDate, customLabel)

  const customPeriodPlan = data.plans.find(
    (p) =>
      p.scope === 'custom_period' &&
      plansMatch(p, type, customLabel) &&
      planAppliesToDate(p, refDate)
  )

  const priority: Record<PlanScope, number> = {
    custom_date: 5,
    day: 4,
    custom_period: 3,
    week: 2,
    month: 1,
  }

  const candidates = [customDatePlan, dayPlan, customPeriodPlan, weekPlan, monthPlan].filter(
    Boolean
  ) as PlanEntry[]
  const plan = candidates.sort((a, b) => priority[b.scope] - priority[a.scope])[0]
  const base = plan ? getDailyPortion(plan, refDate) : 0
  const extra = getCarryForwardExtra(data, type, refDate, customLabel)

  return { base, extra, total: base + extra, plan }
}

export function getScopeTotalTarget(
  data: TrackerData,
  type: TrackableType,
  scope: PlanScope,
  refDate: string,
  customLabel?: string,
  endDate?: string
): number {
  const plan = getPlan(data, type, scope, refDate, customLabel, endDate)
  return plan?.targetMinutes ?? 0
}

/** All plan targets that apply to a given day (day scope wins over week/month per key). */
export function getApplicablePlansForDay(
  data: TrackerData,
  refDate: string
): PlanEntry[] {
  const priority: Record<PlanScope, number> = {
    custom_date: 5,
    day: 4,
    custom_period: 3,
    week: 2,
    month: 1,
  }
  const best = new Map<string, PlanEntry>()

  for (const plan of data.plans) {
    if (!planAppliesToDate(plan, refDate)) continue
    const k = planKey(plan.type, plan.customLabel)
    const existing = best.get(k)
    if (!existing || priority[plan.scope] > priority[existing.scope]) {
      best.set(k, plan)
    }
  }
  return [...best.values()]
}

export function getPlansForScope(
  data: TrackerData,
  scope: PlanScope,
  refDate: string,
  endDate?: string
): PlanEntry[] {
  if (scope === 'custom_date') {
    return data.plans.filter((p) => p.scope === 'custom_date' && p.startDate === refDate)
  }
  if (scope === 'custom_period') {
    return data.plans.filter(
      (p) => p.scope === 'custom_period' && p.startDate === refDate && p.endDate === endDate
    )
  }
  const scopeKey = getScopeStartDate(scope, refDate)
  return data.plans.filter((p) => p.scope === scope && p.startDate === scopeKey)
}

export function getScopeLabel(scope: PlanScope, refDate: string, endDate?: string): string {
  if (scope === 'day') return 'Today'
  if (scope === 'week') return 'This Week'
  if (scope === 'month') return 'This Month'
  if (scope === 'custom_date') return formatDate(refDate, 'MMM d, yyyy')
  if (scope === 'custom_period' && endDate) {
    return `${formatDate(refDate, 'MMM d')} – ${formatDate(endDate, 'MMM d, yyyy')}`
  }
  return scope
}

export interface DeficitResult {
  hasDeficit: boolean
  percent: number
  deficit: number
  planned: number
  achieved: number
}

export function evaluateDeficit(
  planned: number,
  achieved: number,
  threshold = DEFICIT_THRESHOLD
): DeficitResult {
  if (planned <= 0) {
    return { hasDeficit: false, percent: achieved > 0 ? 100 : 0, deficit: 0, planned, achieved }
  }
  const percent = Math.round((achieved / planned) * 100)
  const deficit = Math.max(0, planned - achieved)
  return {
    hasDeficit: achieved / planned < threshold,
    percent,
    deficit,
    planned,
    achieved,
  }
}

export function checkTypeDeficit(
  data: TrackerData,
  type: TrackableType,
  date: string,
  customLabel?: string
): DeficitResult & PlanTargetKey {
  const { total } = getEffectiveDailyTarget(data, type, date, customLabel)
  const achieved = getAchievedMinutes(data, type, date, customLabel)
  return { type, customLabel, ...evaluateDeficit(total, achieved) }
}

export interface SpreadOption {
  days: number
  perDay: number
}

export function suggestSpreadOptions(deficitMinutes: number): SpreadOption[] {
  return [3, 4, 5, 7].map((days) => ({
    days,
    perDay: Math.ceil(deficitMinutes / days),
  }))
}

export function buildCarryForward(
  type: TrackableType,
  originDate: string,
  deficitMinutes: number,
  spreadDays: number,
  originPlanMinutes: number,
  achievedMinutes: number,
  customLabel?: string
): Omit<DeficitCarryForward, 'id' | 'createdAt'> {
  const extraPerDay = Math.ceil(deficitMinutes / spreadDays)
  const startSpreadDate = format(addDays(parseISO(originDate), 1), 'yyyy-MM-dd')
  const endSpreadDate = format(
    addDays(parseISO(startSpreadDate), spreadDays - 1),
    'yyyy-MM-dd'
  )
  return {
    type,
    customLabel,
    originDate,
    originPlanMinutes,
    achievedMinutes,
    deficitMinutes,
    spreadOverDays: spreadDays,
    extraPerDay,
    startSpreadDate,
    endSpreadDate,
    remainingMinutes: extraPerDay * spreadDays,
  }
}

export function getActiveCarryForwards(data: TrackerData, date: string) {
  return data.carryForwards.filter(
    (cf) => cf.remainingMinutes > 0 && date <= cf.endSpreadDate
  )
}

export function getTypeLabel(type: TrackableType, customLabel?: string): string {
  if (type === 'custom' && customLabel) return customLabel
  if (type === 'sleep') return 'Sleep'
  const labels: Record<string, string> = {
    study: 'Study',
    exercise: 'Exercise',
    reading: 'Reading',
    meditation: 'Meditation',
    work: 'Work',
    screen: 'Screen Time',
    social: 'Social',
    custom: 'Others',
  }
  return labels[type] ?? type
}

export function getPlanDisplayId(plan: PlanEntry): string {
  return planKey(plan.type, plan.customLabel)
}
