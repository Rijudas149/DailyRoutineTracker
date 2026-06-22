import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type {
  TrackerData,
  ActivityEntry,
  SleepEntry,
  TrackerSettings,
  ActivityType,
  PlanEntry,
  PlanScope,
  DeficitCarryForward,
  DashboardWidget,
} from '../types'
import { DEFAULT_DASHBOARD_WIDGETS } from '../types'
import { loadData, saveData, importData } from '../lib/storage'
import { todayStr, calcSleepDuration } from '../lib/dates'
import {
  getScopeStartDate,
  buildCarryForward,
  type TrackableType,
} from '../lib/plans'

interface TrackerContextValue {
  data: TrackerData
  addActivity: (entry: Omit<ActivityEntry, 'id' | 'createdAt'>) => void
  removeActivity: (id: string) => void
  addSleep: (entry: Omit<SleepEntry, 'id' | 'duration'> & { duration?: number }) => void
  removeSleep: (id: string) => void
  setPlan: (
    type: TrackableType,
    scope: PlanScope,
    refDate: string,
    targetMinutes: number,
    notes?: string,
    customLabel?: string,
    endDate?: string
  ) => void
  removePlan: (id: string) => void
  addCarryForward: (cf: Omit<DeficitCarryForward, 'id' | 'createdAt'>) => void
  spreadDeficit: (
    type: TrackableType,
    originDate: string,
    deficitMinutes: number,
    spreadDays: number,
    originPlanMinutes: number,
    achievedMinutes: number,
    customLabel?: string
  ) => void
  toggleChecklist: (templateId: string, date?: string) => void
  addChecklistItem: (text: string, category: string) => void
  removeChecklistItem: (id: string) => void
  updateSettings: (settings: Partial<TrackerSettings>) => void
  addDashboardWidget: (widget: Omit<DashboardWidget, 'id'>) => void
  updateDashboardWidget: (id: string, updates: Partial<DashboardWidget>) => void
  removeDashboardWidget: (id: string) => void
  getChecklistForDate: (date: string) => { templateId: string; completed: boolean }[]
  resetData: () => void
  importData: (json: string) => void
  exportData: () => string
}

const TrackerContext = createContext<TrackerContextValue | null>(null)

function uid() {
  return crypto.randomUUID()
}

export function TrackerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TrackerData>(loadData)

  const persist = useCallback((next: TrackerData) => {
    saveData(next)
  }, [])

  useEffect(() => {
    persist(data)
  }, [data, persist])

  useEffect(() => {
    const flush = () => saveData(data)
    window.addEventListener('beforeunload', flush)
    window.addEventListener('pagehide', flush)
    const onVis = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('beforeunload', flush)
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [data])

  const update = useCallback((fn: (prev: TrackerData) => TrackerData) => {
    setData((prev) => {
      const next = fn(prev)
      saveData(next)
      return next
    })
  }, [])

  const addActivity = useCallback(
    (entry: Omit<ActivityEntry, 'id' | 'createdAt'>) => {
      update((prev) => ({
        ...prev,
        activities: [
          ...prev.activities,
          { ...entry, id: uid(), createdAt: new Date().toISOString() },
        ],
      }))
    },
    [update]
  )

  const removeActivity = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        activities: prev.activities.filter((a) => a.id !== id),
      }))
    },
    [update]
  )

  const addSleep = useCallback(
    (entry: Omit<SleepEntry, 'id' | 'duration'> & { duration?: number }) => {
      const duration = entry.duration ?? calcSleepDuration(entry.bedtime, entry.wakeTime)
      update((prev) => {
        const filtered = prev.sleep.filter((s) => s.date !== entry.date)
        return {
          ...prev,
          sleep: [...filtered, { ...entry, id: uid(), duration }],
        }
      })
    },
    [update]
  )

  const removeSleep = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        sleep: prev.sleep.filter((s) => s.id !== id),
      }))
    },
    [update]
  )

  const setPlan = useCallback(
    (
      type: TrackableType,
      scope: PlanScope,
      refDate: string,
      targetMinutes: number,
      notes?: string,
      customLabel?: string,
      endDate?: string
    ) => {
      const startDate =
        scope === 'custom_date' || scope === 'custom_period'
          ? refDate
          : getScopeStartDate(scope, refDate)
      const norm = customLabel?.trim()
      update((prev) => {
        const filtered = prev.plans.filter((p) => {
          if (p.scope !== scope || p.startDate !== startDate || p.type !== type) return true
          if (scope === 'custom_period' && p.endDate !== endDate) return true
          if (type === 'custom') {
            return (p.customLabel ?? '').trim().toLowerCase() !== (norm ?? '').toLowerCase()
          }
          return false
        })
        const plan: PlanEntry = {
          id: uid(),
          type,
          scope,
          startDate,
          endDate: scope === 'custom_period' ? endDate : undefined,
          targetMinutes,
          notes,
          customLabel: type === 'custom' ? norm : undefined,
          createdAt: new Date().toISOString(),
        }
        return { ...prev, plans: [...filtered, plan] }
      })
    },
    [update]
  )

  const removePlan = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        plans: prev.plans.filter((p) => p.id !== id),
      }))
    },
    [update]
  )

  const addCarryForward = useCallback(
    (cf: Omit<DeficitCarryForward, 'id' | 'createdAt'>) => {
      update((prev) => ({
        ...prev,
        carryForwards: [
          ...prev.carryForwards,
          { ...cf, id: uid(), createdAt: new Date().toISOString() },
        ],
      }))
    },
    [update]
  )

  const spreadDeficit = useCallback(
    (
      type: TrackableType,
      originDate: string,
      deficitMinutes: number,
      spreadDays: number,
      originPlanMinutes: number,
      achievedMinutes: number,
      customLabel?: string
    ) => {
      const cf = buildCarryForward(
        type,
        originDate,
        deficitMinutes,
        spreadDays,
        originPlanMinutes,
        achievedMinutes,
        customLabel
      )
      addCarryForward(cf)
    },
    [addCarryForward]
  )

  const getChecklistForDate = useCallback(
    (date: string) => {
      const daily = data.dailyChecklists.find((c) => c.date === date)
      return data.checklistTemplates.map((t) => ({
        templateId: t.id,
        completed: daily?.items.find((i) => i.templateId === t.id)?.completed ?? false,
      }))
    },
    [data.dailyChecklists, data.checklistTemplates]
  )

  const toggleChecklist = useCallback(
    (templateId: string, date = todayStr()) => {
      update((prev) => {
        const existing = prev.dailyChecklists.find((c) => c.date === date)
        if (existing) {
          const items = existing.items.map((item) =>
            item.templateId === templateId
              ? {
                  ...item,
                  completed: !item.completed,
                  completedAt: !item.completed ? new Date().toISOString() : undefined,
                }
              : item
          )
          const hasItem = items.some((i) => i.templateId === templateId)
          if (!hasItem) {
            items.push({ templateId, completed: true, completedAt: new Date().toISOString() })
          }
          return {
            ...prev,
            dailyChecklists: prev.dailyChecklists.map((c) =>
              c.date === date ? { ...c, items } : c
            ),
          }
        }
        return {
          ...prev,
          dailyChecklists: [
            ...prev.dailyChecklists,
            {
              date,
              items: [{ templateId, completed: true, completedAt: new Date().toISOString() }],
            },
          ],
        }
      })
    },
    [update]
  )

  const addChecklistItem = useCallback(
    (text: string, category: string) => {
      update((prev) => ({
        ...prev,
        checklistTemplates: [
          ...prev.checklistTemplates,
          { id: uid(), text, category },
        ],
      }))
    },
    [update]
  )

  const removeChecklistItem = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        checklistTemplates: prev.checklistTemplates.filter((t) => t.id !== id),
      }))
    },
    [update]
  )

  const updateSettings = useCallback(
    (settings: Partial<TrackerSettings>) => {
      update((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...settings },
      }))
    },
    [update]
  )

  const addDashboardWidget = useCallback(
    (widget: Omit<DashboardWidget, 'id'>) => {
      update((prev) => ({
        ...prev,
        dashboardWidgets: [...prev.dashboardWidgets, { ...widget, id: uid() }],
      }))
    },
    [update]
  )

  const updateDashboardWidget = useCallback(
    (id: string, updates: Partial<DashboardWidget>) => {
      update((prev) => ({
        ...prev,
        dashboardWidgets: prev.dashboardWidgets.map((w) =>
          w.id === id ? { ...w, ...updates } : w
        ),
      }))
    },
    [update]
  )

  const removeDashboardWidget = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        dashboardWidgets: prev.dashboardWidgets.filter((w) => w.id !== id),
      }))
    },
    [update]
  )

  const resetData = useCallback(() => {
    update((prev) => ({
      ...prev,
      activities: [],
      sleep: [],
      plans: [],
      carryForwards: [],
      dailyChecklists: [],
      dashboardWidgets: [...DEFAULT_DASHBOARD_WIDGETS],
    }))
  }, [update])

  const importDataFn = useCallback((json: string) => {
    const merged = importData(json)
    setData(merged)
    saveData(merged)
  }, [])

  const exportDataFn = useCallback(() => {
    return JSON.stringify(data, null, 2)
  }, [data])

  return (
    <TrackerContext.Provider
      value={{
        data,
        addActivity,
        removeActivity,
        addSleep,
        removeSleep,
        setPlan,
        removePlan,
        addCarryForward,
        spreadDeficit,
        toggleChecklist,
        addChecklistItem,
        removeChecklistItem,
        updateSettings,
        addDashboardWidget,
        updateDashboardWidget,
        removeDashboardWidget,
        getChecklistForDate,
        resetData,
        importData: importDataFn,
        exportData: exportDataFn,
      }}
    >
      {children}
    </TrackerContext.Provider>
  )
}

export function useTracker() {
  const ctx = useContext(TrackerContext)
  if (!ctx) throw new Error('useTracker must be used within TrackerProvider')
  return ctx
}

export type { ActivityType }
