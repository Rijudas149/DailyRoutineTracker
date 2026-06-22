import { formatTime } from '../lib/dates'
import { toMinutes, calcDurationFromTimeRange, formatTime12h } from '../lib/time'
import { Input } from './ui'
import { TimeInput } from './TimeInput'
import { Clock, Timer } from 'lucide-react'

export type DurationMode = 'manual' | 'range'

interface DurationInputProps {
  mode: DurationMode
  onModeChange: (mode: DurationMode) => void
  hours: string
  minutes: string
  onHoursChange: (v: string) => void
  onMinutesChange: (v: string) => void
  startTime: string
  endTime: string
  onStartTimeChange: (v: string) => void
  onEndTimeChange: (v: string) => void
  label?: string
  quickPresets?: number[]
  onPresetSelect?: (totalMinutes: number) => void
  className?: string
}

export function DurationInput({
  mode,
  onModeChange,
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  label = 'Duration',
  quickPresets,
  onPresetSelect,
  className = '',
}: DurationInputProps) {
  const manualTotal = toMinutes(hours, minutes)
  const rangeTotal =
    startTime && endTime ? calcDurationFromTimeRange(startTime, endTime) : 0
  const displayTotal = mode === 'manual' ? manualTotal : rangeTotal

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 mb-2">
        {label && (
          <label className="text-xs font-medium theme-muted uppercase tracking-wide">{label}</label>
        )}
        <div className="inline-flex gap-0.5 p-0.5 rounded-lg glass-light">
          <button
            type="button"
            onClick={() => onModeChange('manual')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
              mode === 'manual'
                ? 'bg-teal-500/25 text-teal-300'
                : 'theme-muted hover:theme-text'
            }`}
          >
            <Timer className="w-3 h-3" />
            Manual
          </button>
          <button
            type="button"
            onClick={() => onModeChange('range')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
              mode === 'range'
                ? 'bg-teal-500/25 text-teal-300'
                : 'theme-muted hover:theme-text'
            }`}
          >
            <Clock className="w-3 h-3" />
            Time Range
          </button>
        </div>
      </div>

      {mode === 'manual' ? (
        <TimeInput
          hours={hours}
          minutes={minutes}
          onHoursChange={onHoursChange}
          onMinutesChange={onMinutesChange}
          quickPresets={quickPresets}
          onPresetSelect={onPresetSelect}
        />
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="From"
              type="time"
              value={startTime}
              onChange={onStartTimeChange}
            />
            <Input
              label="To"
              type="time"
              value={endTime}
              onChange={onEndTimeChange}
            />
          </div>
          {rangeTotal > 0 && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl glass-light text-sm">
              <span className="theme-muted text-xs">
                {formatTime12h(startTime)} → {formatTime12h(endTime)}
              </span>
              <span className="text-teal-400 font-semibold">{formatTime(rangeTotal)}</span>
            </div>
          )}
        </div>
      )}

      {displayTotal > 0 && mode === 'range' && (
        <p className="text-[10px] theme-muted mt-1.5">Duration calculated automatically</p>
      )}
    </div>
  )
}

export function getDurationMinutes(
  mode: DurationMode,
  hours: string,
  minutes: string,
  startTime: string,
  endTime: string
): number {
  if (mode === 'range') {
    if (!startTime || !endTime) return 0
    return calcDurationFromTimeRange(startTime, endTime)
  }
  return toMinutes(hours, minutes)
}
