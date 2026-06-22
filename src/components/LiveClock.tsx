import { useEffect, useRef, useState } from 'react'
import { Calendar, Clock, Sun, Moon, X } from 'lucide-react'
import { format } from 'date-fns'
import { useTheme } from '../context/ThemeContext'
import { HeaderCalendar } from './HeaderCalendar'
import { HeaderClockPanel } from './HeaderClockPanel'

type OpenPanel = 'calendar' | 'clock' | null

export function LiveClock() {
  const [now, setNow] = useState(() => new Date())
  const [open, setOpen] = useState<OpenPanel>(null)
  const [pickedDate, setPickedDate] = useState<Date | undefined>()
  const { theme, toggleTheme } = useTheme()
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpen(null)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(null)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  function toggle(panel: OpenPanel) {
    setOpen((prev) => (prev === panel ? null : panel))
  }

  return (
    <div ref={barRef} className="fixed top-0 left-0 right-0 z-[90]">
      <header className="glass border-b border-white/5 h-11 flex items-stretch">
        <div className="hidden lg:block w-60 xl:w-64 flex-shrink-0" aria-hidden />

        <div className="flex-1 min-w-0 flex items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 pr-14 sm:pr-6">
          <button
            type="button"
            onClick={() => toggle('calendar')}
            title="Open calendar"
            className={`flex items-center gap-2 text-sm rounded-lg px-2 py-1.5 -ml-2 transition-all ${
              open === 'calendar'
                ? 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/30'
                : 'theme-secondary hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span className="font-medium truncate hidden sm:inline max-w-[200px]">
              {format(pickedDate ?? now, 'MMM d, yyyy')}
            </span>
            <span className="font-medium sm:hidden">{format(now, 'MMM d')}</span>
          </button>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => toggle('clock')}
              title="Open live clock"
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all ${
                open === 'clock'
                  ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30'
                  : 'hover:bg-white/5'
              }`}
            >
              <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span className="font-mono text-sm font-semibold tabular-nums text-teal-300 hidden sm:inline">
                {format(now, 'hh:mm a')}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="theme-toggle p-2 rounded-lg transition-all hidden sm:block"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-teal-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          className="absolute left-0 right-0 glass border-b border-white/5 shadow-lg animate-fade-in"
          style={{ top: '2.75rem' }}
        >
          <div className="hidden lg:block w-60 xl:w-64 absolute left-0 top-0 bottom-0" aria-hidden />
          <div className="lg:ml-60 xl:ml-64 flex justify-center sm:justify-start px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="absolute top-2 right-2 p-1 rounded-lg theme-muted hover:theme-text z-10"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              {open === 'calendar' && (
                <HeaderCalendar
                  selected={pickedDate}
                  onSelect={(d) => {
                    setPickedDate(d)
                  }}
                />
              )}
              {open === 'clock' && <HeaderClockPanel now={now} />}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
