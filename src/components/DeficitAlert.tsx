import { AlertTriangle, CalendarPlus, X } from 'lucide-react'
import type { TrackableType } from '../lib/plans'
import { suggestSpreadOptions, getTypeLabel, type DeficitResult } from '../lib/plans'
import { formatTime, formatDate } from '../lib/dates'
import { Button, Card } from './ui'
import { ACTIVITY_META, type ActivityType } from '../types'

interface DeficitAlertProps {
  type: TrackableType
  customLabel?: string
  result: DeficitResult
  date: string
  onSpread: (days: number) => void
  onDismiss: () => void
}

function typeColor(type: TrackableType): string {
  if (type === 'sleep') return '#a78bfa'
  return ACTIVITY_META[type as ActivityType]?.color ?? '#2dd4bf'
}

export function DeficitAlert({ type, customLabel, result, date, onSpread, onDismiss }: DeficitAlertProps) {
  const options = suggestSpreadOptions(result.deficit)
  const color = typeColor(type)
  const label = getTypeLabel(type, customLabel)

  return (
    <Card className="!p-0 overflow-hidden border border-amber-500/35">
      <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" />
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-amber-200 text-sm sm:text-base">
                  {label} — only {result.percent}% complete
                </h4>
                <p className="text-xs sm:text-sm text-amber-200/75 mt-1.5 leading-relaxed">
                  Planned <strong>{formatTime(result.planned)}</strong>, achieved{' '}
                  <strong>{formatTime(result.achieved)}</strong> on {formatDate(date, 'MMM d')}.
                  Short by <strong className="text-amber-300">{formatTime(result.deficit)}</strong>.
                </p>
              </div>
              <button type="button" onClick={onDismiss} className="theme-muted hover:theme-text p-1 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs theme-muted mt-4 mb-2">Spread remaining time across upcoming days:</p>
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => (
                <Button key={opt.days} size="sm" variant="secondary" onClick={() => onSpread(opt.days)}>
                  <CalendarPlus className="w-3.5 h-3.5 inline mr-1" />
                  {opt.days}d × {formatTime(opt.perDay)}
                </Button>
              ))}
            </div>
            <button type="button" onClick={onDismiss} className="text-xs theme-muted hover:theme-text mt-3">
              Skip — I&apos;ll catch up myself
            </button>
          </div>
          <div className="hidden sm:block w-1 self-stretch rounded-full flex-shrink-0 opacity-60" style={{ background: color }} />
        </div>
      </div>
    </Card>
  )
}

export function CarryForwardBanner({
  type, customLabel, extraPerDay, endDate, originDate,
}: {
  type: TrackableType
  customLabel?: string
  extraPerDay: number
  endDate: string
  originDate: string
}) {
  const label = getTypeLabel(type, customLabel)
  const color = typeColor(type)

  return (
    <div
      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs border"
      style={{ background: `${color}10`, borderColor: `${color}30` }}
    >
      <CalendarPlus className="w-4 h-4 flex-shrink-0" style={{ color }} />
      <span className="theme-secondary leading-relaxed">
        <strong style={{ color }}>+{formatTime(extraPerDay)}</strong> {label} today
        <span className="theme-muted">
          {' '}· makeup from {formatDate(originDate, 'MMM d')} → {formatDate(endDate, 'MMM d')}
        </span>
      </span>
    </div>
  )
}
