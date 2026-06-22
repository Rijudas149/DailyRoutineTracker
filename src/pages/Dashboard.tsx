import { useState } from 'react'
import {
  TrendingUp,
  Clock,
  Target,
  AlertTriangle,
  Pencil,
  Check,
} from 'lucide-react'
import { useTracker } from '../context/TrackerContext'
import { getPeriodStats } from '../lib/analytics'
import { todayStr, formatTime, formatDate } from '../lib/dates'
import { Card, StatCard, ProgressRing, Button, PageHeader, InfoBanner, SectionTitle, ActivityRow, ProgressBar, MiniStat, EmptyState, DashedAddButton } from '../components/ui'
import { CarryForwardBanner } from '../components/DeficitAlert'
import { WidgetIcon } from '../components/WidgetIcon'
import { WidgetForm } from '../components/WidgetForm'
import { ACTIVITY_META } from '../types'
import {
  getActiveCarryForwards,
  getTypeLabel,
  checkTypeDeficit,
  getApplicablePlansForDay,
  getEffectiveDailyTarget,
} from '../lib/plans'
import {
  getWidgetLabel,
  getWidgetColor,
  getWidgetAchieved,
  getWidgetTarget,
} from '../lib/dashboard'

export function Dashboard() {
  const {
    data,
    getChecklistForDate,
    addDashboardWidget,
    updateDashboardWidget,
    removeDashboardWidget,
  } = useTracker()
  const today = todayStr()
  const weekStats = getPeriodStats(data, 'week')
  const checklist = getChecklistForDate(today)
  const completedCount = checklist.filter((c) => c.completed).length
  const checklistTotal = checklist.length
  const checklistPct =
    checklistTotal > 0 ? (completedCount / checklistTotal) * 100 : 0

  const [editMode, setEditMode] = useState(false)
  const [formMode, setFormMode] = useState<'add' | string | null>(null)

  const applicablePlans = getApplicablePlansForDay(data, today)

  const behindGoals = applicablePlans.filter((plan) => {
    const { total } = getEffectiveDailyTarget(data, plan.type, today, plan.customLabel)
    if (total <= 0) return false
    return checkTypeDeficit(data, plan.type, today, plan.customLabel).hasDeficit
  })

  const activeMakeups = getActiveCarryForwards(data, today)

  const recentActivities = [...data.activities]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  const planItems = applicablePlans
    .map((plan) => {
      const widget: typeof data.dashboardWidgets[0] = {
        id: plan.id,
        metricType: plan.type === 'sleep' ? 'sleep' : plan.type === 'custom' ? 'custom' : (plan.type as 'study'),
        customLabel: plan.customLabel,
        targetMinutes: 0,
      }
      const { target: total, extra } = getWidgetTarget(data, widget, today, checklistTotal)
      const achieved = getWidgetAchieved(data, widget, today, completedCount, checklistTotal)
      if (total <= 0) return null
      return {
        id: plan.id,
        type: plan.type,
        customLabel: plan.customLabel,
        total,
        extra,
        achieved,
        pct: Math.min((achieved / total) * 100, 100),
      }
    })
    .filter(Boolean) as {
    id: string
    type: (typeof applicablePlans)[number]['type']
    customLabel?: string
    total: number
    extra: number
    achieved: number
    pct: number
  }[]

  const progressWidgets = data.dashboardWidgets.filter((w) => {
    if (w.metricType === 'checklist') return checklistTotal > 0
    const { target } = getWidgetTarget(data, w, today, checklistTotal)
    return target > 0 || w.targetMinutes > 0
  }).slice(0, 3)

  function renderWidgetValue(widget: typeof data.dashboardWidgets[0]) {
    const achieved = getWidgetAchieved(
      data,
      widget,
      today,
      completedCount,
      checklistTotal
    )
    if (widget.metricType === 'checklist') {
      return `${achieved}/${checklistTotal}`
    }
    return formatTime(achieved)
  }

  function renderWidgetSub(widget: typeof data.dashboardWidgets[0]) {
    const { target, extra, fromPlan } = getWidgetTarget(
      data,
      widget,
      today,
      checklistTotal
    )

    if (widget.metricType === 'checklist') {
      return `${Math.round(checklistPct)}% complete`
    }

    if (target <= 0) {
      return editMode ? 'Set target below' : 'No target — tap Edit'
    }

    const planNote = fromPlan ? ' (from Goals)' : ''
    const makeup = extra > 0 ? ` (+${formatTime(extra)} makeup)` : ''
    return `Target: ${formatTime(target)}${makeup}${planNote}`
  }

  function renderWidgetProgress(widget: typeof data.dashboardWidgets[0]) {
    const achieved = getWidgetAchieved(
      data,
      widget,
      today,
      completedCount,
      checklistTotal
    )
    const { target } = getWidgetTarget(data, widget, today, checklistTotal)

    if (widget.metricType === 'checklist') {
      return checklistTotal > 0 ? checklistPct : undefined
    }
    if (target <= 0) return undefined
    return (achieved / target) * 100
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        badge={formatDate(today, 'EEEE, MMM d')}
        title={
          <>
            Hello, <span className="gradient-text">{data.settings.name}</span>
          </>
        }
        subtitle="Your personalized dashboard"
        action={
          <Button
            variant={editMode ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setEditMode(!editMode)
              setFormMode(null)
            }}
          >
            {editMode ? (
              <><Check className="w-4 h-4 inline mr-1" />Done</>
            ) : (
              <><Pencil className="w-4 h-4 inline mr-1" />Edit</>
            )}
          </Button>
        }
      />

      {editMode && (
        <InfoBanner variant="info">
          <strong className="text-teal-300">Edit mode:</strong> Set daily targets, add custom
          cards, or remove ones you don&apos;t need. Goals page targets override when set.
        </InfoBanner>
      )}

      {behindGoals.length > 0 && !editMode && (
        <InfoBanner variant="warning" icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}>
          Behind on{' '}
          <strong>{behindGoals.map((p) => getTypeLabel(p.type, p.customLabel)).join(', ')}</strong>{' '}
          today — head to Goals to log progress.
        </InfoBanner>
      )}

      {activeMakeups.map((cf) => (
        <CarryForwardBanner
          key={cf.id}
          type={cf.type}
          customLabel={cf.customLabel}
          extraPerDay={cf.extraPerDay}
          endDate={cf.endSpreadDate}
          originDate={cf.originDate}
        />
      ))}

      {/* Customizable stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {data.dashboardWidgets.map((widget) => (
          <StatCard
            key={widget.id}
            compact
            editing={editMode}
            label={getWidgetLabel(widget)}
            value={renderWidgetValue(widget)}
            sub={renderWidgetSub(widget)}
            icon={
              <WidgetIcon
                type={widget.metricType}
                className="w-4 h-4"
              />
            }
            color={getWidgetColor(widget)}
            progress={renderWidgetProgress(widget)}
            onEdit={
              editMode
                ? () => setFormMode(widget.id)
                : undefined
            }
            onRemove={
              editMode && data.dashboardWidgets.length > 1
                ? () => {
                    if (confirm('Remove this card from dashboard?')) {
                      removeDashboardWidget(widget.id)
                      if (formMode === widget.id) setFormMode(null)
                    }
                  }
                : undefined
            }
          />
        ))}

        {editMode && (
          <DashedAddButton label="Add Card" onClick={() => setFormMode('add')} />
        )}
      </div>

      {formMode === 'add' && (
        <WidgetForm
          existingWidgets={data.dashboardWidgets}
          onSave={(w) => {
            addDashboardWidget(w)
            setFormMode(null)
          }}
          onCancel={() => setFormMode(null)}
        />
      )}

      {formMode && formMode !== 'add' && (
        <WidgetForm
          initial={data.dashboardWidgets.find((w) => w.id === formMode)}
          existingWidgets={data.dashboardWidgets}
          excludeId={formMode}
          onSave={(w) => {
            updateDashboardWidget(formMode, w)
            setFormMode(null)
          }}
          onCancel={() => setFormMode(null)}
        />
      )}

      {planItems.length > 0 && !editMode && (
        <Card accent>
          <SectionTitle icon={<Target className="w-4 h-4" />} title="Plan vs Reality" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {planItems.map(({ id, type, customLabel, total, achieved, extra, pct }) => {
              const color = type === 'sleep' ? '#a78bfa' : ACTIVITY_META[type as keyof typeof ACTIVITY_META]?.color ?? '#14b8a6'
              return (
                <div key={id} className="p-3.5 rounded-xl glass-light">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="theme-secondary font-medium">{getTypeLabel(type, customLabel)}</span>
                    <span className={pct < 60 ? 'text-amber-400 font-semibold' : 'text-teal-400 font-semibold'}>
                      {Math.round(pct)}%
                    </span>
                  </div>
                  <p className="text-xs theme-muted mb-2.5">
                    {formatTime(achieved)} / {formatTime(total)}
                    {extra > 0 && ` (+${formatTime(extra)} catch-up)`}
                  </p>
                  <ProgressBar pct={pct} color={color} warning={pct < 60} height="sm" />
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {!editMode && (
        <div className="grid lg:grid-cols-3 gap-6">
          {progressWidgets.length > 0 && (
            <Card className="lg:col-span-1">
              <SectionTitle icon={<Target className="w-4 h-4" />} title="Today's Goals" />
              <div className="flex justify-around flex-wrap gap-4">
                {progressWidgets.map((widget) => {
                  const achieved = getWidgetAchieved(
                    data,
                    widget,
                    today,
                    completedCount,
                    checklistTotal
                  )
                  const { target } = getWidgetTarget(
                    data,
                    widget,
                    today,
                    checklistTotal
                  )
                  const max =
                    widget.metricType === 'checklist' ? checklistTotal || 1 : target
                  return (
                    <ProgressRing
                      key={widget.id}
                      value={achieved}
                      max={max}
                      color={getWidgetColor(widget)}
                      label={getWidgetLabel(widget)}
                      size={72}
                    />
                  )
                })}
              </div>
            </Card>
          )}

          <Card className={progressWidgets.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <SectionTitle
              icon={<TrendingUp className="w-4 h-4" />}
              title="This Week"
              className="mb-5"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStat value={`${weekStats.studyHours.toFixed(1)}h`} label="Study" color="#14b8a6" />
              <MiniStat value={`${weekStats.sleepHours.toFixed(1)}h`} label="Sleep" color="#a78bfa" />
              <MiniStat value={`${weekStats.exerciseMinutes}m`} label="Exercise" color="#22d3ee" />
              <MiniStat value={`${Math.round(weekStats.checklistRate)}%`} label="Habits" color="#fbbf24" />
            </div>
          </Card>
        </div>
      )}

      {!editMode && (
        <Card>
          <SectionTitle icon={<Clock className="w-4 h-4" />} title="Recent Activity" />
          {recentActivities.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-8 h-8" />}
              title="No activity yet"
              description="Set targets in Goals, then log your progress to see it here."
            />
          ) : (
            <div className="space-y-2">
              {recentActivities.map((a) => {
                const meta = ACTIVITY_META[a.type]
                return (
                  <ActivityRow
                    key={a.id}
                    color={meta.color}
                    title={a.label || meta.label}
                    subtitle={formatDate(a.date, 'MMM d')}
                    value={formatTime(a.duration)}
                  />
                )
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
