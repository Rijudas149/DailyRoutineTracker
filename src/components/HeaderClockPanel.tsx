import { format } from 'date-fns'

interface HeaderClockPanelProps {
  now: Date
}

export function HeaderClockPanel({ now }: HeaderClockPanelProps) {
  return (
    <div className="p-6 w-[min(100vw-2rem,280px)] text-center">
      <p className="text-xs theme-muted uppercase tracking-widest mb-2">
        {format(now, 'EEEE')}
      </p>
      <p className="font-mono text-4xl sm:text-5xl font-bold tabular-nums tracking-wide text-teal-400">
        {format(now, 'hh:mm:ss')}
      </p>
      <p className="text-lg font-semibold text-cyan-400/90 mt-1 tabular-nums">
        {format(now, 'a')}
      </p>
      <p className="text-sm theme-muted mt-4 pt-4 border-t border-white/5">
        {format(now, 'MMMM d, yyyy')}
      </p>
    </div>
  )
}
