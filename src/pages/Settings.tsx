import { useRef, useState } from 'react'
import { Download, Upload, Trash2, Save, User, Target, Database, Info } from 'lucide-react'
import { useTracker } from '../context/TrackerContext'
import { Card, Button, Input, PageHeader, SectionTitle } from '../components/ui'
import { formatTime } from '../lib/dates'
import { getLastSavedAt } from '../lib/storage'

export function Settings() {
  const { data, updateSettings, resetData, importData, exportData } = useTracker()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState(data.settings.name)
  const [studyGoal, setStudyGoal] = useState(String(data.settings.dailyStudyGoal))
  const [sleepGoal, setSleepGoal] = useState(String(data.settings.dailySleepGoal))
  const [wakeUp, setWakeUp] = useState(data.settings.wakeUpTime)
  const [bedTime, setBedTime] = useState(data.settings.bedTime)

  function handleSave() {
    updateSettings({
      name: name || 'My Tracker',
      dailyStudyGoal: parseInt(studyGoal, 10) || 120,
      dailySleepGoal: parseInt(sleepGoal, 10) || 480,
      wakeUpTime: wakeUp,
      bedTime: bedTime,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleExport() {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lifetracker-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        importData(ev.target?.result as string)
        alert('Data imported successfully!')
      } catch {
        alert('Invalid file format.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <PageHeader title="Settings" subtitle="Customize your tracker experience" badge="Preferences" />

      <Card>
        <SectionTitle icon={<User className="w-4 h-4" />} title="Profile" />
        <Input label="Your Name" value={name} onChange={setName} placeholder="Enter your name" />
      </Card>

      <Card>
        <SectionTitle
          icon={<Target className="w-4 h-4" />}
          title="Default Goals"
          subtitle="Fallback targets when dashboard cards have none set"
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label={`Study (${formatTime(parseInt(studyGoal, 10) || 0)})`}
            type="number"
            value={studyGoal}
            onChange={setStudyGoal}
          />
          <Input
            label={`Sleep (${formatTime(parseInt(sleepGoal, 10) || 0)})`}
            type="number"
            value={sleepGoal}
            onChange={setSleepGoal}
          />
          <Input label="Wake Up" type="time" value={wakeUp} onChange={setWakeUp} />
          <Input label="Bedtime" type="time" value={bedTime} onChange={setBedTime} />
        </div>
        <p className="text-xs theme-muted mt-3">Values in minutes · 120 = 2 hours</p>
      </Card>

      <Button onClick={handleSave} className="w-full sm:w-auto">
        <Save className="w-4 h-4 inline mr-1.5" />
        {saved ? 'Saved!' : 'Save Settings'}
      </Button>

      <Card>
        <SectionTitle
          icon={<Database className="w-4 h-4" />}
          title="Data Management"
          subtitle="Auto-saved on this device — survives closing and reopening the app"
        />
        {getLastSavedAt() && (
          <p className="text-xs theme-muted mb-3 -mt-2">
            Last saved: {new Date(getLastSavedAt()!).toLocaleString()}
          </p>
        )}
        <p className="text-xs theme-muted mb-4 leading-relaxed">
          Your data is stored locally with a backup copy. Export a JSON file occasionally for extra safety.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-4 h-4 inline mr-1" />
            Export
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="w-4 h-4 inline mr-1" />
            Import
          </Button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Button variant="danger" onClick={() => confirm('Delete all tracking data?') && resetData()}>
            <Trash2 className="w-4 h-4 inline mr-1" />
            Reset
          </Button>
        </div>
      </Card>

      <Card className="!p-4">
        <SectionTitle icon={<Info className="w-4 h-4" />} title="About LifeTracker" />
        <p className="text-sm theme-muted leading-relaxed">
          Track study, sleep, exercise, and habits. Set goals, log progress, and view reports —
          all stored privately on your device.
        </p>
        <p className="text-xs theme-muted mt-3 opacity-60">Version 1.0.0</p>
      </Card>
    </div>
  )
}
