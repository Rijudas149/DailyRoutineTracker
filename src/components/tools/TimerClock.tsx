import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, Timer, Bell } from 'lucide-react'
import { Button, Card, SectionTitle } from '../ui'

const PRESETS = [
  { label: '5m', seconds: 5 * 60 },
  { label: '10m', seconds: 10 * 60 },
  { label: '15m', seconds: 15 * 60 },
  { label: '25m', seconds: 25 * 60 },
  { label: '30m', seconds: 30 * 60 },
  { label: '1h', seconds: 60 * 60 },
]

function formatCountdown(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function playAlarm() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.value = 0.15
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc.stop(ctx.currentTime + 0.8)
  } catch {
    /* audio unavailable */
  }
}

export function TimerClock() {
  const [hours, setHours] = useState('0')
  const [minutes, setMinutes] = useState('5')
  const [seconds, setSeconds] = useState('0')
  const [remaining, setRemaining] = useState(0)
  const [initial, setInitial] = useState(0)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const endRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  useEffect(() => () => clearTimer(), [clearTimer])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000))
      setRemaining(left)
      if (left <= 0) {
        clearTimer()
        setRunning(false)
        setFinished(true)
        playAlarm()
      }
    }, 100)
    return clearTimer
  }, [running, clearTimer])

  function totalInputSeconds() {
    return (
      (parseInt(hours, 10) || 0) * 3600 +
      (parseInt(minutes, 10) || 0) * 60 +
      (parseInt(seconds, 10) || 0)
    )
  }

  function handleStartPause() {
    if (finished) {
      setFinished(false)
      setRemaining(0)
      setInitial(0)
      return
    }
    if (running) {
      clearTimer()
      setRunning(false)
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000))
      setRemaining(left)
      const h = Math.floor(left / 3600)
      const m = Math.floor((left % 3600) / 60)
      const s = left % 60
      setHours(String(h))
      setMinutes(String(m))
      setSeconds(String(s))
    } else {
      const total = remaining > 0 ? remaining : totalInputSeconds()
      if (total <= 0) return
      setInitial(total)
      setRemaining(total)
      endRef.current = Date.now() + total * 1000
      setRunning(true)
      setFinished(false)
    }
  }

  function handleReset() {
    clearTimer()
    setRunning(false)
    setFinished(false)
    setRemaining(0)
    setInitial(0)
    setHours('0')
    setMinutes('5')
    setSeconds('0')
  }

  function applyPreset(sec: number) {
    if (running) return
    setFinished(false)
    setRemaining(0)
    setInitial(0)
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    setHours(String(h))
    setMinutes(String(m))
    setSeconds(String(s))
  }

  const displaySec = running || finished ? remaining : totalInputSeconds()
  const progress = initial > 0 ? ((initial - remaining) / initial) * 100 : 0

  return (
    <Card className="flex flex-col items-center">
      <SectionTitle icon={<Timer className="w-4 h-4" />} title="Timer" className="self-stretch" />

      <div className="relative py-8 sm:py-10 w-full flex flex-col items-center">
        {initial > 0 && running && (
          <svg className="absolute inset-0 w-40 h-40 sm:w-48 sm:h-48 mx-auto opacity-20" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--progress-track)" strokeWidth="4" />
            <circle
              cx="50" cy="50" r="45" fill="none" stroke="#14b8a6" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              transform="rotate(-90 50 50)"
              className="transition-all duration-300"
            />
          </svg>
        )}
        <span
          className={`font-mono text-5xl sm:text-6xl font-bold tabular-nums tracking-tight relative ${
            finished ? 'text-amber-400 animate-pulse' : 'text-cyan-400'
          }`}
        >
          {finished ? '00:00' : formatCountdown(displaySec)}
        </span>
        {finished && (
          <p className="text-sm text-amber-400 mt-3 flex items-center gap-1.5">
            <Bell className="w-4 h-4" />
            Time&apos;s up!
          </p>
        )}
      </div>

      {!running && !finished && (
        <div className="w-full max-w-xs mb-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Hr', value: hours, set: setHours, max: 23 },
              { label: 'Min', value: minutes, set: setMinutes, max: 59 },
              { label: 'Sec', value: seconds, set: setSeconds, max: 59 },
            ].map(({ label, value, set, max }) => (
              <div key={label}>
                <label className="block text-[10px] font-medium theme-muted mb-1 uppercase text-center">
                  {label}
                </label>
                <input
                  type="number"
                  min={0}
                  max={max}
                  value={value}
                  onChange={(e) => {
                    const v = Math.min(max, Math.max(0, parseInt(e.target.value, 10) || 0))
                    set(String(v))
                  }}
                  className="input-field text-center font-mono text-lg py-2"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p.seconds)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium glass-light theme-muted hover:text-teal-400 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3 w-full max-w-sm">
        <Button
          variant={finished ? 'primary' : running ? 'secondary' : 'primary'}
          onClick={handleStartPause}
          className="flex-1 min-w-[100px]"
          disabled={!running && !finished && totalInputSeconds() <= 0}
        >
          {finished ? (
            <><RotateCcw className="w-4 h-4 inline mr-1" />Done</>
          ) : running ? (
            <><Pause className="w-4 h-4 inline mr-1" />Pause</>
          ) : (
            <><Play className="w-4 h-4 inline mr-1" />Start</>
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={handleReset}
          disabled={running}
        >
          <RotateCcw className="w-4 h-4 inline mr-1" />
          Reset
        </Button>
      </div>
    </Card>
  )
}
