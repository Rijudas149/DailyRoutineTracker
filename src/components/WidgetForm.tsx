import { useState } from 'react'
import type { DashboardWidget, DashboardMetricType } from '../types'
import { Card, Button, Input, Select, SectionTitle } from './ui'
import { TimeInput } from './TimeInput'
import { METRIC_OPTIONS, WIDGET_COLORS, isWidgetDuplicate } from '../lib/dashboard'
import { toMinutes, fromMinutes } from '../lib/time'
import { LayoutGrid } from 'lucide-react'

interface WidgetFormProps {
  initial?: Partial<DashboardWidget>
  existingWidgets: DashboardWidget[]
  excludeId?: string
  onSave: (data: Omit<DashboardWidget, 'id'>) => void
  onCancel: () => void
}

export function WidgetForm({
  initial,
  existingWidgets,
  excludeId,
  onSave,
  onCancel,
}: WidgetFormProps) {
  const [metricType, setMetricType] = useState<DashboardMetricType>(
    initial?.metricType ?? 'study'
  )
  const [customLabel, setCustomLabel] = useState(initial?.customLabel ?? '')
  const [displayLabel, setDisplayLabel] = useState(initial?.displayLabel ?? '')
  const initMins = initial?.targetMinutes ?? 0
  const [hours, setHours] = useState(fromMinutes(initMins).hours)
  const [minutes, setMinutes] = useState(fromMinutes(initMins).minutes)
  const [color, setColor] = useState(initial?.color ?? WIDGET_COLORS[0])

  const isCustom = metricType === 'custom'
  const isChecklist = metricType === 'checklist'

  function handleSave() {
    if (isCustom && !customLabel.trim()) return
    if (isWidgetDuplicate(existingWidgets, metricType, customLabel, excludeId)) {
      alert(
        isCustom
          ? 'This custom activity already exists on your dashboard.'
          : 'This activity is already on your dashboard.'
      )
      return
    }
    onSave({
      metricType,
      customLabel: isCustom ? customLabel.trim() : undefined,
      displayLabel: displayLabel.trim() || undefined,
      targetMinutes: isChecklist ? 0 : toMinutes(hours, minutes),
      color,
    })
  }

  return (
    <Card className="border border-teal-500/25">
      <SectionTitle
        icon={<LayoutGrid className="w-4 h-4" />}
        title={initial ? 'Edit Dashboard Card' : 'Add Dashboard Card'}
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <Select
          label="Activity"
          value={metricType}
          onChange={(v) => setMetricType(v as DashboardMetricType)}
          options={METRIC_OPTIONS}
        />
        {isCustom && (
          <Input
            label="Custom Name"
            value={customLabel}
            onChange={setCustomLabel}
            placeholder="e.g. Guitar, Cooking"
          />
        )}
        <Input
          label="Display Name (optional)"
          value={displayLabel}
          onChange={setDisplayLabel}
          placeholder="Override card label"
          className="sm:col-span-2"
        />
        {!isChecklist && (
          <TimeInput
            label="Daily Target"
            hours={hours}
            minutes={minutes}
            onHoursChange={setHours}
            onMinutesChange={setMinutes}
            quickPresets={[30, 60, 90, 120, 180]}
            onPresetSelect={(d) => {
              const { hours: h, minutes: m } = fromMinutes(d)
              setHours(h)
              setMinutes(m)
            }}
            className="sm:col-span-2"
          />
        )}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium theme-muted mb-2 uppercase tracking-wide">
            Accent Color
          </label>
          <div className="flex gap-2 flex-wrap p-3 rounded-xl glass-light">
            {WIDGET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-all ${
                  color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-105'
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-5">
        <Button size="sm" onClick={handleSave}>Save Card</Button>
        <Button size="sm" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </Card>
  )
}
