import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HeaderCalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
}

export function HeaderCalendar({ selected, onSelect }: HeaderCalendarProps) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()))
  const today = new Date()

  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="p-4 w-[min(100vw-2rem,320px)]">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-white/10 theme-muted hover:theme-text transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-semibold theme-text text-sm">{format(viewMonth, 'MMMM yyyy')}</h3>
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-white/10 theme-muted hover:theme-text transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekdays.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold theme-muted py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const inMonth = isSameMonth(day, viewMonth)
          const todayCell = isToday(day)
          const selectedCell = selected ? isSameDay(day, selected) : false
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelect?.(day)}
              className={`aspect-square rounded-lg text-xs font-medium transition-all ${
                !inMonth ? 'theme-muted opacity-40' : 'theme-secondary'
              } ${
                selectedCell
                  ? 'bg-teal-500 text-white shadow-sm'
                  : todayCell
                    ? 'ring-2 ring-teal-500/60 bg-teal-500/15 text-teal-400'
                    : 'hover:bg-white/8'
              }`}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>

      <p className="text-center text-xs theme-muted mt-3 pt-3 border-t border-white/5">
        Today: <span className="text-teal-400 font-medium">{format(today, 'EEEE, MMM d')}</span>
      </p>
    </div>
  )
}
