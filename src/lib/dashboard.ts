import type { TrackerData, DashboardWidget, DashboardMetricType } from '../types'
import { ACTIVITY_META, type ActivityType } from '../types'
import { getEffectiveDailyTarget, getAchievedMinutes, getTypeLabel } from './plans'
import type { TrackableType } from './plans'

export function getWidgetLabel(widget: DashboardWidget): string {
  if (widget.displayLabel) return widget.displayLabel
  if (widget.metricType === 'custom' && widget.customLabel) return widget.customLabel
  if (widget.metricType === 'checklist') return 'Checklist'
  return getTypeLabel(widget.metricType as TrackableType)
}

export function getWidgetColor(widget: DashboardWidget): string {
  if (widget.color) return widget.color
  if (widget.metricType === 'sleep') return '#a78bfa'
  if (widget.metricType === 'checklist') return '#2dd4bf'
  if (widget.metricType === 'custom') return '#94a3b8'
  return ACTIVITY_META[widget.metricType as ActivityType]?.color ?? '#2dd4bf'
}

export function getWidgetAchieved(
  data: TrackerData,
  widget: DashboardWidget,
  date: string,
  checklistCompleted?: number,
  _checklistTotal?: number
): number {
  if (widget.metricType === 'checklist') {
    return checklistCompleted ?? 0
  }
  if (widget.metricType === 'custom') {
    return getAchievedMinutes(data, 'custom', date, widget.customLabel)
  }
  return getAchievedMinutes(data, widget.metricType as TrackableType, date)
}

export function getWidgetTarget(
  data: TrackerData,
  widget: DashboardWidget,
  date: string,
  checklistTotal?: number
): { target: number; extra: number; fromPlan: boolean } {
  if (widget.metricType === 'checklist') {
    return { target: checklistTotal ?? 0, extra: 0, fromPlan: false }
  }

  const trackType =
    widget.metricType === 'custom' ? 'custom' : (widget.metricType as TrackableType)
  const { total, extra } = getEffectiveDailyTarget(
    data,
    trackType,
    date,
    widget.customLabel
  )

  if (total > 0) {
    return { target: total, extra, fromPlan: true }
  }

  return { target: widget.targetMinutes, extra: 0, fromPlan: false }
}

export const METRIC_OPTIONS: { value: DashboardMetricType; label: string }[] = [
  { value: 'study', label: 'Study' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'reading', label: 'Reading' },
  { value: 'meditation', label: 'Meditation' },
  { value: 'work', label: 'Work' },
  { value: 'checklist', label: 'Checklist' },
  { value: 'custom', label: 'Others (custom)' },
]

export const WIDGET_COLORS = [
  '#2dd4bf',
  '#22d3ee',
  '#a78bfa',
  '#fbbf24',
  '#38bdf8',
  '#fb7185',
  '#c084fc',
  '#94a3b8',
]

export function isWidgetDuplicate(
  widgets: DashboardWidget[],
  metricType: DashboardMetricType,
  customLabel?: string,
  excludeId?: string
): boolean {
  if (metricType === 'custom') {
    const norm = (customLabel ?? '').trim().toLowerCase()
    if (!norm) return true
    return widgets.some(
      (w) =>
        w.id !== excludeId &&
        w.metricType === 'custom' &&
        (w.customLabel ?? '').trim().toLowerCase() === norm
    )
  }
  if (metricType === 'checklist') return false
  return widgets.some((w) => w.id !== excludeId && w.metricType === metricType)
}
