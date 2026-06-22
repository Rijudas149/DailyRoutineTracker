import { useState } from 'react'
import { Check, Plus, Trash2, PartyPopper, ListChecks } from 'lucide-react'
import { useTracker } from '../context/TrackerContext'
import { todayStr, formatDate } from '../lib/dates'
import { Card, Button, Input, ProgressRing, PageHeader, SectionTitle, Select } from '../components/ui'

const CATEGORY_COLORS: Record<string, string> = {
  Morning: '#fbbf24',
  Health: '#22d3ee',
  Fitness: '#2dd4bf',
  Learning: '#a78bfa',
  Wellness: '#c084fc',
  Evening: '#818cf8',
  Custom: '#94a3b8',
}

export function Checklist() {
  const { data, toggleChecklist, addChecklistItem, removeChecklistItem, getChecklistForDate } = useTracker()
  const today = todayStr()
  const [newItem, setNewItem] = useState('')
  const [newCategory, setNewCategory] = useState('Custom')

  const items = getChecklistForDate(today)
  const completed = items.filter((i) => i.completed).length
  const total = items.length
  const allDone = total > 0 && completed === total

  const categories = [...new Set(data.checklistTemplates.map((t) => t.category))]

  const grouped = categories.map((cat) => ({
    category: cat,
    color: CATEGORY_COLORS[cat] ?? '#94a3b8',
    items: data.checklistTemplates
      .filter((t) => t.category === cat)
      .map((t) => ({
        ...t,
        completed: items.find((i) => i.templateId === t.id)?.completed ?? false,
      })),
  }))

  function handleAdd() {
    if (!newItem.trim()) return
    addChecklistItem(newItem.trim(), newCategory)
    setNewItem('')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        badge="Daily habits"
        title="Checklist"
        subtitle={formatDate(today, 'EEEE, MMMM d')}
        action={
          <ProgressRing value={completed} max={total || 1} color="#2dd4bf" label="Done" size={76} />
        }
      />

      {allDone && (
        <Card className="!p-4 border border-emerald-500/30 bg-emerald-500/8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20">
              <PartyPopper className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-emerald-300 text-sm">All tasks completed!</p>
              <p className="text-xs text-emerald-400/80 mt-0.5">Great job staying on track today.</p>
            </div>
          </div>
        </Card>
      )}

      {grouped.map(({ category, color, items: catItems }) => (
        <Card key={category} className="!p-4 sm:!p-5">
          <SectionTitle
            title={category}
            subtitle={`${catItems.filter((i) => i.completed).length} of ${catItems.length} done`}
            className="mb-3"
            iconBare
            icon={
              <span
                className="w-2.5 h-2.5 rounded-full block"
                style={{ background: color, boxShadow: `0 0 8px ${color}88` }}
              />
            }
          />
          <div className="space-y-1.5">
            {catItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleChecklist(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group ${
                  item.completed
                    ? 'bg-emerald-500/8 border border-emerald-500/20'
                    : 'glass-light hover:border-teal-500/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                    item.completed
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                      : 'border-2 border-slate-600 group-hover:border-teal-400'
                  }`}
                >
                  {item.completed && <Check className="w-3 h-3" />}
                </div>
                <span
                  className={`flex-1 text-sm ${
                    item.completed ? 'theme-muted line-through' : 'theme-text'
                  }`}
                >
                  {item.text}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeChecklistItem(item.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </button>
            ))}
          </div>
        </Card>
      ))}

      <Card>
        <SectionTitle icon={<ListChecks className="w-4 h-4" />} title="Add Custom Task" />
        <div className="flex flex-col sm:flex-row gap-3">
          <Input value={newItem} onChange={setNewItem} placeholder="e.g. Practice piano" className="flex-1" />
          <Select
            value={newCategory}
            onChange={setNewCategory}
            options={[
              ...categories.map((c) => ({ value: c, label: c })),
              { value: 'Custom', label: 'Custom' },
            ]}
            className="sm:w-40"
          />
          <Button onClick={handleAdd} className="sm:self-end">
            <Plus className="w-4 h-4 inline mr-1" />
            Add
          </Button>
        </div>
      </Card>
    </div>
  )
}
