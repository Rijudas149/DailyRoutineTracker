import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, Flag } from 'lucide-react'
import { Button, Card, SectionTitle } from '../ui'

function formatStopwatch(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const cs = Math.floor((ms % 1000) / 10)
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
}

export function Stopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const startRef = useRef(0)
  const baseRef = useRef(0)
  const frameRef = useRef<number>(0)

  const tick = useCallback(() => {
    setElapsed(baseRef.current + (performance.now() - startRef.current))
    // eslint-disable-next-line react-hooks/immutability
    frameRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (running) {
      startRef.current = performance.now()
      frameRef.current = requestAnimationFrame(tick)
    }
    return () => cancelAnimationFrame(frameRef.current)
  }, [running, tick])

  function handleStartPause() {
    if (running) {
      baseRef.current = elapsed
      setRunning(false)
    } else {
      setRunning(true)
    }
  }

  function handleReset() {
    setRunning(false)
    setElapsed(0)
    baseRef.current = 0
    setLaps([])
  }

  function handleLap() {
    if (!running && elapsed === 0) return
    setLaps((prev) => [elapsed, ...prev])
  }

  const bestLap = laps.length > 1 ? Math.min(...laps) : null
  const worstLap = laps.length > 1 ? Math.max(...laps) : null

  return (
    <Card className="flex flex-col items-center">
      <SectionTitle icon={<Flag className="w-4 h-4" />} title="Stopwatch" className="self-stretch" />

      <div className="py-8 sm:py-10 w-full flex justify-center">
        <span className="font-mono text-5xl sm:text-6xl font-bold tabular-nums tracking-tight text-teal-400">
          {formatStopwatch(elapsed)}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-3 w-full max-w-sm">
        <Button
          variant={running ? 'secondary' : 'primary'}
          onClick={handleStartPause}
          className="flex-1 min-w-25"
        >
          {running ? (
            <><Pause className="w-4 h-4 inline mr-1" />Pause</>
          ) : (
            <><Play className="w-4 h-4 inline mr-1" />{elapsed > 0 ? 'Resume' : 'Start'}</>
          )}
        </Button>
        <Button variant="secondary" onClick={handleLap} disabled={elapsed === 0 && !running}>
          <Flag className="w-4 h-4 inline mr-1" />
          Lap
        </Button>
        <Button variant="ghost" onClick={handleReset} disabled={elapsed === 0 && laps.length === 0}>
          <RotateCcw className="w-4 h-4 inline mr-1" />
          Reset
        </Button>
      </div>

      {laps.length > 0 && (
        <div className="w-full mt-6 max-h-48 overflow-y-auto space-y-1">
          <p className="text-xs theme-muted uppercase tracking-wide mb-2">Laps</p>
          {laps.map((lap, i) => {
            const lapNum = laps.length - i
            const isBest = lap === bestLap
            const isWorst = lap === worstLap
            return (
              <div
                key={`${lap}-${i}`}
                className="flex justify-between items-center px-3 py-2 rounded-lg glass-light text-sm"
              >
                <span className="theme-muted">Lap {lapNum}</span>
                <span
                  className={`font-mono font-semibold tabular-nums ${
                    isBest ? 'text-emerald-400' : isWorst ? 'text-amber-400' : 'text-teal-400'
                  }`}
                >
                  {formatStopwatch(lap)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
