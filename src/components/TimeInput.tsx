import { formatTime } from '../lib/dates'
import { toMinutes } from '../lib/time'

interface TimeInputProps {
  label?: string
  hours: string
  minutes: string
  onHoursChange: (v: string) => void
  onMinutesChange: (v: string) => void
  className?: string
  quickPresets?: number[]
  onPresetSelect?: (totalMinutes: number) => void
}

export function TimeInput({
  label, hours, minutes, onHoursChange, onMinutesChange,
  className = '', quickPresets, onPresetSelect,
}: TimeInputProps) {
  const total = toMinutes(hours, minutes)

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium theme-muted mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3 flex-wrap p-3 rounded-xl glass-light">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={99}
              value={hours}
              onChange={(e) => onHoursChange(e.target.value)}
              placeholder="0"
              className="w-12 px-2 py-2 rounded-lg input-field text-center text-sm !w-14"
            />
            <span className="text-xs theme-muted font-medium">hr</span>
          </div>
          <span className="theme-muted text-xs">:</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={59}
              value={minutes}
              onChange={(e) => onMinutesChange(e.target.value)}
              placeholder="0"
              className="w-12 px-2 py-2 rounded-lg input-field text-center text-sm !w-14"
            />
            <span className="text-xs theme-muted font-medium">min</span>
          </div>
        </div>

        <div className="h-8 w-px bg-white/10 hidden sm:block" />

        <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
          <div className="px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs flex-shrink-0">
            <span className="theme-muted">Total </span>
            <span className="text-teal-400 font-semibold">
              {total > 0 ? formatTime(total) : '—'}
            </span>
          </div>
          {quickPresets && onPresetSelect && (
            <div className="flex items-center gap-1 flex-wrap">
              {quickPresets.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onPresetSelect(d)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                    total === d
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'glass-light theme-muted hover:text-teal-300'
                  }`}
                >
                  {formatTime(d)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
