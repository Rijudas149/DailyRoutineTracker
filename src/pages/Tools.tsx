import { PageHeader, TabGroup } from '../components/ui'
import { Stopwatch } from '../components/tools/Stopwatch'
import { TimerClock } from '../components/tools/TimerClock'
import { useState } from 'react'
import { Timer, Flag } from 'lucide-react'

export function Tools() {
  const [tab, setTab] = useState<'stopwatch' | 'timer'>('stopwatch')

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        badge="Utilities"
        title="Tools"
        subtitle="Stopwatch and timer — like your phone clock app"
      />

      <TabGroup
        tabs={[
          { id: 'stopwatch', label: 'Stopwatch', icon: <Flag className="w-4 h-4" /> },
          { id: 'timer', label: 'Timer', icon: <Timer className="w-4 h-4" /> },
        ]}
        value={tab}
        onChange={(v) => setTab(v as 'stopwatch' | 'timer')}
      />

      <div className="max-w-lg mx-auto">
        {tab === 'stopwatch' ? <Stopwatch /> : <TimerClock />}
      </div>
    </div>
  )
}
