export type ActivityType =
  | 'study'
  | 'exercise'
  | 'reading'
  | 'meditation'
  | 'work'
  | 'screen'
  | 'social'
  | 'custom'

export type Period = 'day' | 'week' | 'month' | 'year'

export type PlanScope = 'day' | 'week' | 'month' | 'custom_date' | 'custom_period'

export interface PlanEntry {
  id: string
  type: ActivityType | 'sleep'
  scope: PlanScope
  startDate: string // scope anchor date (day itself, week start, month start, or custom date/period start)
  endDate?: string // for custom_period
  targetMinutes: number
  customLabel?: string // for type === 'custom'
  notes?: string
  createdAt: string
}

export interface DeficitCarryForward {
  id: string
  type: ActivityType | 'sleep'
  customLabel?: string
  originDate: string
  originPlanMinutes: number
  achievedMinutes: number
  deficitMinutes: number
  spreadOverDays: number
  extraPerDay: number
  startSpreadDate: string
  endSpreadDate: string
  remainingMinutes: number
  createdAt: string
}

export interface ActivityEntry {
  id: string
  type: ActivityType
  label: string
  duration: number // minutes
  date: string // YYYY-MM-DD
  startTime?: string // HH:mm — when logged via time range
  endTime?: string // HH:mm
  notes?: string
  createdAt: string
}

export interface SleepEntry {
  id: string
  date: string
  bedtime: string // HH:mm
  wakeTime: string // HH:mm
  duration: number // minutes
  quality: 1 | 2 | 3 | 4 | 5
  notes?: string
}

export interface ChecklistTemplate {
  id: string
  text: string
  category: string
  icon?: string
}

export interface ChecklistCompletion {
  templateId: string
  completed: boolean
  completedAt?: string
}

export interface DailyChecklist {
  date: string
  items: ChecklistCompletion[]
}

export interface CustomCategory {
  id: string
  name: string
  icon: string
  color: string
  unit: 'minutes' | 'hours' | 'count'
}

export interface TrackerSettings {
  name: string
  dailyStudyGoal: number // minutes
  dailySleepGoal: number // minutes
  wakeUpTime: string
  bedTime: string
}

export type DashboardMetricType =
  | 'study'
  | 'sleep'
  | 'exercise'
  | 'reading'
  | 'meditation'
  | 'work'
  | 'checklist'
  | 'custom'

export interface DashboardWidget {
  id: string
  metricType: DashboardMetricType
  customLabel?: string
  displayLabel?: string
  targetMinutes: number
  color?: string
}

export interface TrackerData {
  activities: ActivityEntry[]
  sleep: SleepEntry[]
  plans: PlanEntry[]
  carryForwards: DeficitCarryForward[]
  checklistTemplates: ChecklistTemplate[]
  dailyChecklists: DailyChecklist[]
  customCategories: CustomCategory[]
  dashboardWidgets: DashboardWidget[]
  settings: TrackerSettings
}

export interface DaySummary {
  date: string
  studyMinutes: number
  sleepMinutes: number
  exerciseMinutes: number
  readingMinutes: number
  totalActiveMinutes: number
  checklistCompleted: number
  checklistTotal: number
  activities: ActivityEntry[]
}

export interface PeriodStats {
  label: string
  studyHours: number
  sleepHours: number
  exerciseMinutes: number
  readingMinutes: number
  avgSleepQuality: number
  checklistRate: number
  totalActiveHours: number
  daysTracked: number
}

export const DEFAULT_CHECKLIST: ChecklistTemplate[] = [
  { id: 'c1', text: 'Wake up on time', category: 'Morning', icon: 'sunrise' },
  { id: 'c2', text: 'Drink water (8 glasses)', category: 'Health', icon: 'droplets' },
  { id: 'c3', text: 'Exercise / Workout', category: 'Fitness', icon: 'dumbbell' },
  { id: 'c4', text: 'Study session', category: 'Learning', icon: 'book-open' },
  { id: 'c5', text: 'Read for 30 min', category: 'Learning', icon: 'book' },
  { id: 'c6', text: 'Meditate', category: 'Wellness', icon: 'brain' },
  { id: 'c7', text: 'Healthy meals', category: 'Health', icon: 'apple' },
  { id: 'c8', text: 'No social media before bed', category: 'Evening', icon: 'moon' },
  { id: 'c9', text: 'Journal / Reflect', category: 'Evening', icon: 'pen-line' },
  { id: 'c10', text: 'Sleep by target time', category: 'Evening', icon: 'bed' },
]

export const ACTIVITY_META: Record<ActivityType, { label: string; color: string; icon: string }> = {
  study: { label: 'Study', color: '#2dd4bf', icon: 'book-open' },
  exercise: { label: 'Exercise', color: '#22d3ee', icon: 'dumbbell' },
  reading: { label: 'Reading', color: '#fbbf24', icon: 'book' },
  meditation: { label: 'Meditation', color: '#c084fc', icon: 'brain' },
  work: { label: 'Work', color: '#38bdf8', icon: 'briefcase' },
  screen: { label: 'Screen Time', color: '#fb7185', icon: 'monitor' },
  social: { label: 'Social', color: '#f472b6', icon: 'users' },
  custom: { label: 'Others', color: '#94a3b8', icon: 'sparkles' },
}

export const DEFAULT_SETTINGS: TrackerSettings = {
  name: 'My Tracker',
  dailyStudyGoal: 120,
  dailySleepGoal: 480,
  wakeUpTime: '07:00',
  bedTime: '23:00',
}

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidget[] = [
  { id: 'dw-study', metricType: 'study', targetMinutes: 0 },
  { id: 'dw-sleep', metricType: 'sleep', targetMinutes: 0 },
  { id: 'dw-exercise', metricType: 'exercise', targetMinutes: 0 },
  { id: 'dw-checklist', metricType: 'checklist', targetMinutes: 0 },
]
