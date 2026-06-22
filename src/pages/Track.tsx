import { useState } from 'react'
import {
  Plus,
  Moon,
  Target,
  CheckCircle2,
  Clock,
  LineChart,
} from 'lucide-react'
import { useTracker } from '../context/TrackerContext'
import { todayStr, formatTime, formatDate } from '../lib/dates'
import { setDurationFromTotal, formatTime12h } from '../lib/time'
import { Card, Button, Input, Select, PageHeader, TabGroup, SectionTitle, InfoBanner, ActivityRow, ProgressBar, MiniStat, EmptyState } from '../components/ui'
import { DurationInput, getDurationMinutes, type DurationMode } from '../components/DurationInput'
import { CheckProgress } from '../components/CheckProgress'
import { DeficitAlert, CarryForwardBanner } from '../components/DeficitAlert'
import { ACTIVITY_META, type ActivityType, type PlanScope } from '../types'
import {
  getScopeTotalTarget,
  getEffectiveDailyTarget,
  getAchievedMinutes,
  checkTypeDeficit,
  getActiveCarryForwards,
  getTypeLabel,
  getPlansForScope,
  getApplicablePlansForDay,
  getDailyPortion,
  getScopeLabel,
  type TrackableType,
} from '../lib/plans'

type LogPeriod = 'today' | 'custom_date' | 'custom_period'

const planActivityOptions = [
  { value: 'study', label: 'Study' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'reading', label: 'Reading' },
  { value: 'meditation', label: 'Meditation' },
  { value: 'work', label: 'Work' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'custom', label: 'Others' },
]

const logActivityOptions = [
  ...Object.entries(ACTIVITY_META)
    .filter(([key]) => key !== 'custom')
    .map(([value, meta]) => ({ value, label: meta.label })),
  { value: 'custom', label: 'Others' },
]

const scopeOptions = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom_date', label: 'Custom Date' },
  { value: 'custom_period', label: 'Custom Period' },
]

const logPeriodOptions = [
  { value: 'today', label: 'Today' },
  { value: 'custom_date', label: 'Custom Date' },
  { value: 'custom_period', label: 'Custom Period' },
]

function typeColor(type: TrackableType | ActivityType): string {
  if (type === 'sleep') return '#a78bfa'
  return ACTIVITY_META[type as ActivityType]?.color ?? '#2dd4bf'
}

export function Track() {
  const {
    data,
    addActivity,
    removeActivity,
    addSleep,
    removeSleep,
    setPlan,
    removePlan,
    spreadDeficit,
  } = useTracker()
  const today = todayStr()

  const [mainTab, setMainTab] = useState<'plan' | 'achieve' | 'progress'>('plan')
  const [planScope, setPlanScope] = useState<PlanScope>('day')
  const [planCustomDate, setPlanCustomDate] = useState(todayStr())
  const [planPeriodStart, setPlanPeriodStart] = useState(todayStr())
  const [planPeriodEnd, setPlanPeriodEnd] = useState(todayStr())
  const [planType, setPlanType] = useState<TrackableType>('study')
  const [planHours, setPlanHours] = useState('3')
  const [planMinutes, setPlanMinutes] = useState('0')
  const [planDurationMode, setPlanDurationMode] = useState<DurationMode>('manual')
  const [planRangeStart, setPlanRangeStart] = useState('09:00')
  const [planRangeEnd, setPlanRangeEnd] = useState('12:00')
  const [planCustomName, setPlanCustomName] = useState('')
  const [planNotes, setPlanNotes] = useState('')

  const [achieveTab, setAchieveTab] = useState<'activity' | 'sleep'>('activity')
  const [logPeriod, setLogPeriod] = useState<LogPeriod>('today')
  const [logCustomDate, setLogCustomDate] = useState(todayStr())
  const [logPeriodStart, setLogPeriodStart] = useState(todayStr())
  const [logPeriodEnd, setLogPeriodEnd] = useState(todayStr())
  const [logDateInPeriod, setLogDateInPeriod] = useState(todayStr())
  const [activityType, setActivityType] = useState<ActivityType>('study')
  const [durationMode, setDurationMode] = useState<DurationMode>('manual')
  const [achieveHours, setAchieveHours] = useState('1')
  const [achieveMinutes, setAchieveMinutes] = useState('0')
  const [rangeStart, setRangeStart] = useState('10:00')
  const [rangeEnd, setRangeEnd] = useState('12:00')
  const [notes, setNotes] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const [bedtime, setBedtime] = useState(data.settings.bedTime)
  const [wakeTime, setWakeTime] = useState(data.settings.wakeUpTime)
  const [sleepQuality, setSleepQuality] = useState('4')
  const [sleepNotes, setSleepNotes] = useState('')

  const [deficitAlert, setDeficitAlert] = useState<{
    type: TrackableType
    customLabel?: string
    result: ReturnType<typeof checkTypeDeficit>
  } | null>(null)

  const planAnchor =
    planScope === 'custom_date'
      ? planCustomDate
      : planScope === 'custom_period'
        ? planPeriodStart
        : today

  const planEnd = planScope === 'custom_period' ? planPeriodEnd : undefined

  const scopePlans = getPlansForScope(data, planScope, planAnchor, planEnd)

  function resolveLogDate(): string {
    if (logPeriod === 'custom_date') return logCustomDate
    if (logPeriod === 'custom_period') return logDateInPeriod
    return today
  }

  const activeLogDate = resolveLogDate()

  const displayedActivities = data.activities
    .filter((a) => {
      if (logPeriod === 'custom_period') {
        return a.date >= logPeriodStart && a.date <= logPeriodEnd
      }
      return a.date === activeLogDate
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const todaySleep = data.sleep.find((s) => s.date === activeLogDate)
  const activeMakeups = getActiveCarryForwards(data, today)
  const quickDurations = [15, 30, 45, 60, 90, 120]
  const quickPlanDurations = [30, 60, 90, 120, 180, 240]

  function checkAndShowDeficit(
    type: TrackableType,
    freshData = data,
    customLabel?: string,
    date = today
  ) {
    const { total } = getEffectiveDailyTarget(freshData, type, date, customLabel)
    if (total <= 0) return
    const result = checkTypeDeficit(freshData, type, date, customLabel)
    if (result.hasDeficit) {
      setDeficitAlert({ type, customLabel, result })
    }
  }

  function handleSetPlan() {
    const totalMins = getDurationMinutes(
      planDurationMode,
      planHours,
      planMinutes,
      planRangeStart,
      planRangeEnd
    )
    if (totalMins <= 0) return
    if (planType === 'custom' && !planCustomName.trim()) return
    if (planScope === 'custom_period' && planPeriodStart > planPeriodEnd) return

    const anchor =
      planScope === 'custom_date'
        ? planCustomDate
        : planScope === 'custom_period'
          ? planPeriodStart
          : today

    setPlan(
      planType,
      planScope,
      anchor,
      totalMins,
      planNotes || undefined,
      planType === 'custom' ? planCustomName.trim() : undefined,
      planScope === 'custom_period' ? planPeriodEnd : undefined
    )
    setPlanNotes('')
    setPlanCustomName('')
  }

  function handleAddActivity() {
    const mins = getDurationMinutes(
      durationMode,
      achieveHours,
      achieveMinutes,
      rangeStart,
      rangeEnd
    )
    if (mins <= 0) return
    if (activityType === 'custom' && !customLabel.trim()) return
    if (logPeriod === 'custom_period' && logPeriodStart > logPeriodEnd) return

    const logDate = resolveLogDate()
    const meta = ACTIVITY_META[activityType]
    const label = activityType === 'custom' ? customLabel.trim() : meta.label
    const entry = {
      type: activityType,
      label,
      duration: mins,
      date: logDate,
      startTime: durationMode === 'range' ? rangeStart : undefined,
      endTime: durationMode === 'range' ? rangeEnd : undefined,
      notes: notes || undefined,
    }
    addActivity(entry)

    const freshData = {
      ...data,
      activities: [
        ...data.activities,
        { ...entry, id: 'temp', createdAt: new Date().toISOString() },
      ],
    }

    if (activityType === 'custom') {
      checkAndShowDeficit('custom', freshData, label, logDate)
    } else if (
      ['study', 'exercise', 'reading', 'meditation', 'work'].includes(activityType)
    ) {
      checkAndShowDeficit(activityType as TrackableType, freshData, undefined, logDate)
    }

    setAchieveHours('0')
    setAchieveMinutes('30')
    setNotes('')
    setCustomLabel('')
  }

  function handleAddSleep() {
    const duration = calcSleepDurationLocal(bedtime, wakeTime)
    const sleepDate = resolveLogDate()
    addSleep({
      date: sleepDate,
      bedtime,
      wakeTime,
      quality: parseInt(sleepQuality, 10) as 1 | 2 | 3 | 4 | 5,
      notes: sleepNotes || undefined,
    })

    const freshData = {
      ...data,
      sleep: [
        ...data.sleep.filter((s) => s.date !== sleepDate),
        {
          id: 'temp',
          date: sleepDate,
          bedtime,
          wakeTime,
          duration,
          quality: parseInt(sleepQuality, 10) as 1 | 2 | 3 | 4 | 5,
        },
      ],
    }
    checkAndShowDeficit('sleep', freshData, undefined, sleepDate)
    setSleepNotes('')
  }

  function calcSleepDurationLocal(bed: string, wake: string) {
    const [bh, bm] = bed.split(':').map(Number)
    const [wh, wm] = wake.split(':').map(Number)
    let b = bh * 60 + bm
    let w = wh * 60 + wm
    if (w <= b) w += 24 * 60
    return w - b
  }

  function handleSpread(days: number) {
    if (!deficitAlert) return
    const { type, customLabel, result } = deficitAlert
    spreadDeficit(
      type,
      today,
      result.deficit,
      days,
      result.planned,
      result.achieved,
      customLabel
    )
    setDeficitAlert(null)
  }

  const planProgress = getApplicablePlansForDay(data, today)
    .map((plan) => {
      const { extra, total } = getEffectiveDailyTarget(
        data,
        plan.type,
        today,
        plan.customLabel
      )
      const achieved = getAchievedMinutes(data, plan.type, today, plan.customLabel)
      const pct = total > 0 ? Math.min((achieved / total) * 100, 100) : 0
      return {
        id: plan.id,
        type: plan.type,
        customLabel: plan.customLabel,
        extra,
        total,
        achieved,
        pct,
        scope: plan.scope,
      }
    })
    .filter((p) => p.total > 0)

  const isPlanCustom = planType === 'custom'
  const isAchieveCustom = activityType === 'custom'

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        badge="Goals & tracking"
        title="Goals & Progress"
        subtitle="Set targets first, then log what you achieved"
      />

      <TabGroup
        tabs={[
          { id: 'plan', label: 'Set Targets', icon: <Target className="w-4 h-4" /> },
          { id: 'achieve', label: 'Log Progress', icon: <CheckCircle2 className="w-4 h-4" /> },
          { id: 'progress', label: 'Check Progress', icon: <LineChart className="w-4 h-4" /> },
        ]}
        value={mainTab}
        onChange={(v) => setMainTab(v as 'plan' | 'achieve' | 'progress')}
      />

      {deficitAlert && (
        <DeficitAlert
          type={deficitAlert.type}
          customLabel={deficitAlert.customLabel}
          result={deficitAlert.result}
          date={today}
          onSpread={handleSpread}
          onDismiss={() => setDeficitAlert(null)}
        />
      )}

      {activeMakeups.length > 0 && (
        <div className="space-y-2">
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
        </div>
      )}

      {mainTab === 'progress' ? (
        <CheckProgress />
      ) : mainTab === 'plan' ? (
        <>
          <Card>
            <SectionTitle icon={<Target className="w-4 h-4" />} title="Create a Target" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Time Period"
                value={planScope}
                onChange={(v) => setPlanScope(v as PlanScope)}
                options={scopeOptions}
              />
              {planScope === 'custom_date' && (
                <Input
                  label="Target Date"
                  type="date"
                  value={planCustomDate}
                  onChange={setPlanCustomDate}
                />
              )}
              {planScope === 'custom_period' && (
                <>
                  <Input
                    label="Period Start"
                    type="date"
                    value={planPeriodStart}
                    onChange={setPlanPeriodStart}
                  />
                  <Input
                    label="Period End"
                    type="date"
                    value={planPeriodEnd}
                    onChange={setPlanPeriodEnd}
                  />
                </>
              )}
              <Select
                label="Activity"
                value={planType}
                onChange={(v) => setPlanType(v as TrackableType)}
                options={planActivityOptions}
              />
              {isPlanCustom && (
                <Input
                  label="Custom Activity Name"
                  value={planCustomName}
                  onChange={setPlanCustomName}
                  placeholder="e.g. Guitar practice, Cooking"
                  className="sm:col-span-2"
                />
              )}
              <DurationInput
                mode={planDurationMode}
                onModeChange={setPlanDurationMode}
                hours={planHours}
                minutes={planMinutes}
                onHoursChange={setPlanHours}
                onMinutesChange={setPlanMinutes}
                startTime={planRangeStart}
                endTime={planRangeEnd}
                onStartTimeChange={setPlanRangeStart}
                onEndTimeChange={setPlanRangeEnd}
                label={
                  planScope === 'day' || planScope === 'custom_date'
                    ? 'Target Time'
                    : planScope === 'custom_period'
                      ? 'Total Time for Period'
                      : `Total Time for ${planScope}`
                }
                quickPresets={quickPlanDurations}
                onPresetSelect={(d) => setDurationFromTotal(d, setPlanHours, setPlanMinutes)}
                className="sm:col-span-2"
              />
              <Input
                label="Notes (optional)"
                value={planNotes}
                onChange={setPlanNotes}
                placeholder="e.g. Finish chapter 5"
                className="sm:col-span-2"
              />
            </div>

            <Button onClick={handleSetPlan} className="mt-4">
              <Plus className="w-4 h-4 inline mr-1" />
              Save Target
            </Button>
          </Card>

          <Card>
            <SectionTitle
              icon={<Target className="w-4 h-4" />}
              title={`Current Targets — ${getScopeLabel(planScope, planAnchor, planEnd)}`}
            />
            {scopePlans.length === 0 ? (
              <EmptyState
                icon={<Target className="w-8 h-8" />}
                title="No targets yet"
                description="Add what you plan to accomplish using the form above."
              />
            ) : (
              <div className="space-y-2">
                {scopePlans.map((p) => {
                  const color = typeColor(p.type)
                  const total = getScopeTotalTarget(
                    data,
                    p.type,
                    planScope,
                    planAnchor,
                    p.customLabel,
                    planEnd
                  )
                  const daily = getDailyPortion(p, today)
                  const name = getTypeLabel(p.type, p.customLabel)
                  const detail =
                    planScope === 'day' || planScope === 'custom_date'
                      ? formatTime(total)
                      : `${formatTime(total)} total (~${formatTime(daily)}/day)`
                  return (
                    <ActivityRow
                      key={p.id}
                      color={color}
                      title={name}
                      subtitle={[detail, p.notes].filter(Boolean).join(' · ')}
                      value={formatTime(total)}
                      onRemove={() => removePlan(p.id)}
                    />
                  )
                })}
              </div>
            )}
          </Card>

          <InfoBanner variant="info" icon={<Target className="w-4 h-4 text-teal-400" />}>
            <strong className="text-teal-300">Tip:</strong> Set daily, weekly, or monthly targets
            including custom activities under <em>Others</em>.
          </InfoBanner>
        </>
      ) : (
        <>
          {planProgress.length > 0 && (
            <Card accent>
              <SectionTitle
                icon={<Clock className="w-4 h-4" />}
                title="Today: Planned vs Achieved"
              />
              <div className="space-y-3">
                {planProgress.map(({ id, type, customLabel: cl, total, achieved, extra, pct }) => {
                  const color = typeColor(type)
                  const status = pct >= 100 ? 'done' : pct >= 60 ? 'ok' : 'behind'
                  return (
                    <div key={id}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="theme-secondary">
                          {getTypeLabel(type, cl)}
                          {extra > 0 && (
                            <span className="text-amber-400 text-xs ml-1">
                              (+{formatTime(extra)} makeup)
                            </span>
                          )}
                        </span>
                        <span
                          className={
                            status === 'behind'
                              ? 'text-amber-400 font-medium'
                              : status === 'done'
                                ? 'text-teal-400 font-medium'
                                : 'theme-muted'
                          }
                        >
                          {formatTime(achieved)} / {formatTime(total)}
                          {status === 'behind' && ' ⚠'}
                        </span>
                      </div>
                      <ProgressBar pct={pct} color={color} warning={status === 'behind'} />
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          <div className="flex gap-2">
            <TabGroup
              tabs={[
                { id: 'activity', label: 'Activities' },
                { id: 'sleep', label: 'Sleep', icon: <Moon className="w-4 h-4" /> },
              ]}
              value={achieveTab}
              onChange={(v) => setAchieveTab(v as 'activity' | 'sleep')}
            />
          </div>

          <Card className="!p-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select
                label="Time Period"
                value={logPeriod}
                onChange={(v) => setLogPeriod(v as LogPeriod)}
                options={logPeriodOptions}
              />
              {logPeriod === 'custom_date' && (
                <Input
                  label="Activity Date"
                  type="date"
                  value={logCustomDate}
                  onChange={setLogCustomDate}
                />
              )}
              {logPeriod === 'custom_period' && (
                <>
                  <Input
                    label="Period Start"
                    type="date"
                    value={logPeriodStart}
                    onChange={(v) => {
                      setLogPeriodStart(v)
                      if (logDateInPeriod < v) setLogDateInPeriod(v)
                    }}
                  />
                  <Input
                    label="Period End"
                    type="date"
                    value={logPeriodEnd}
                    onChange={(v) => {
                      setLogPeriodEnd(v)
                      if (logDateInPeriod > v) setLogDateInPeriod(v)
                    }}
                  />
                  <Input
                    label="Activity Date"
                    type="date"
                    value={logDateInPeriod}
                    onChange={setLogDateInPeriod}
                  />
                </>
              )}
            </div>
          </Card>

          {achieveTab === 'activity' ? (
            <>
              <Card>
                <SectionTitle title="Log What You Did" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Select
                    label="Activity Type"
                    value={activityType}
                    onChange={(v) => setActivityType(v as ActivityType)}
                    options={logActivityOptions}
                  />
                  {isAchieveCustom && (
                    <Input
                      label="Custom Activity Name"
                      value={customLabel}
                      onChange={setCustomLabel}
                      placeholder="e.g. Guitar practice, Cooking"
                    />
                  )}
                  <DurationInput
                    mode={durationMode}
                    onModeChange={setDurationMode}
                    hours={achieveHours}
                    minutes={achieveMinutes}
                    onHoursChange={setAchieveHours}
                    onMinutesChange={setAchieveMinutes}
                    startTime={rangeStart}
                    endTime={rangeEnd}
                    onStartTimeChange={setRangeStart}
                    onEndTimeChange={setRangeEnd}
                    quickPresets={quickDurations}
                    onPresetSelect={(d) =>
                      setDurationFromTotal(d, setAchieveHours, setAchieveMinutes)
                    }
                    className="sm:col-span-2"
                  />
                  <Input
                    label="Notes (optional)"
                    value={notes}
                    onChange={setNotes}
                    placeholder="What did you work on?"
                    className="sm:col-span-2"
                  />
                </div>

                <Button onClick={handleAddActivity} className="mt-4">
                  <Plus className="w-4 h-4 inline mr-1" />
                  Log Achievement
                </Button>
              </Card>

              <Card>
                <SectionTitle
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  title={
                    logPeriod === 'custom_period'
                      ? `Period Log (${displayedActivities.length})`
                      : `Log for ${logPeriod === 'today' ? 'Today' : formatDate(activeLogDate, 'MMM d')} (${displayedActivities.length})`
                  }
                />
                {displayedActivities.length === 0 ? (
                  <EmptyState
                    icon={<Clock className="w-8 h-8" />}
                    title="Nothing logged yet"
                    description="Log your first activity above to start tracking."
                  />
                ) : (
                  <div className="space-y-2">
                    {displayedActivities.map((a) => {
                      const meta = ACTIVITY_META[a.type]
                      const timeNote =
                        a.startTime && a.endTime
                          ? `${formatTime12h(a.startTime)} – ${formatTime12h(a.endTime)}`
                          : undefined
                      const subtitle = [logPeriod === 'custom_period' ? formatDate(a.date, 'MMM d') : undefined, timeNote, a.notes]
                        .filter(Boolean)
                        .join(' · ')
                      return (
                        <ActivityRow
                          key={a.id}
                          color={meta.color}
                          title={a.label || meta.label}
                          subtitle={subtitle || undefined}
                          value={formatTime(a.duration)}
                          onRemove={() => removeActivity(a.id)}
                        />
                      )
                    })}
                  </div>
                )}
              </Card>
            </>
          ) : (
            <>
              <Card>
                <SectionTitle icon={<Moon className="w-4 h-4" />} title="Log Sleep" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Bedtime" type="time" value={bedtime} onChange={setBedtime} />
                  <Input label="Wake Time" type="time" value={wakeTime} onChange={setWakeTime} />
                  <Select
                    label="Sleep Quality"
                    value={sleepQuality}
                    onChange={setSleepQuality}
                    options={[
                      { value: '1', label: '1 - Terrible' },
                      { value: '2', label: '2 - Poor' },
                      { value: '3', label: '3 - Okay' },
                      { value: '4', label: '4 - Good' },
                      { value: '5', label: '5 - Excellent' },
                    ]}
                  />
                  <Input
                    label="Notes (optional)"
                    value={sleepNotes}
                    onChange={setSleepNotes}
                    placeholder="How did you sleep?"
                  />
                </div>
                <Button onClick={handleAddSleep} className="mt-4">
                  <Moon className="w-4 h-4 inline mr-1" />
                  {todaySleep ? 'Update Sleep' : 'Log Sleep'}
                </Button>
              </Card>

              {todaySleep && (
                <Card glow>
                  <SectionTitle icon={<Moon className="w-4 h-4" />} title={`Sleep — ${formatDate(activeLogDate, 'MMM d')}`} />
                  <div className="grid grid-cols-3 gap-3">
                    <MiniStat value={todaySleep.bedtime} label="Bedtime" color="#a78bfa" />
                    <MiniStat value={formatTime(todaySleep.duration)} label="Duration" color="#14b8a6" />
                    <MiniStat value={'★'.repeat(todaySleep.quality)} label="Quality" color="#fbbf24" />
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeSleep(todaySleep.id)}
                    className="mt-4"
                  >
                    Remove
                  </Button>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
