import type { TrackerData } from '../types'
import { DEFAULT_CHECKLIST, DEFAULT_SETTINGS, DEFAULT_DASHBOARD_WIDGETS } from '../types'

const STORAGE_KEY = 'lifetracker-data'
const BACKUP_KEY = 'lifetracker-data-backup'
const SESSION_KEY = 'lifetracker-data'
const META_KEY = 'lifetracker-meta'

export function getDefaultData(): TrackerData {
  return {
    activities: [],
    sleep: [],
    plans: [],
    carryForwards: [],
    checklistTemplates: [...DEFAULT_CHECKLIST],
    dailyChecklists: [],
    customCategories: [],
    dashboardWidgets: [...DEFAULT_DASHBOARD_WIDGETS],
    settings: { ...DEFAULT_SETTINGS },
  }
}

function normalizeData(parsed: Partial<TrackerData>): TrackerData {
  const defaults = getDefaultData()
  return {
    ...defaults,
    ...parsed,
    activities: parsed.activities ?? defaults.activities,
    sleep: parsed.sleep ?? defaults.sleep,
    plans: parsed.plans ?? defaults.plans,
    carryForwards: parsed.carryForwards ?? defaults.carryForwards,
    dailyChecklists: parsed.dailyChecklists ?? defaults.dailyChecklists,
    customCategories: parsed.customCategories ?? defaults.customCategories,
    settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    checklistTemplates:
      parsed.checklistTemplates && parsed.checklistTemplates.length > 0
        ? parsed.checklistTemplates
        : [...DEFAULT_CHECKLIST],
    dashboardWidgets:
      parsed.dashboardWidgets && parsed.dashboardWidgets.length > 0
        ? parsed.dashboardWidgets
        : [...DEFAULT_DASHBOARD_WIDGETS],
  }
}

function parseStored(raw: string | null): TrackerData | null {
  if (!raw) return null
  try {
    return normalizeData(JSON.parse(raw) as Partial<TrackerData>)
  } catch {
    return null
  }
}

function readFromStorage(store: Storage, key: string): TrackerData | null {
  try {
    return parseStored(store.getItem(key))
  } catch {
    return null
  }
}

/** Try primary → backup → session storage so data survives reloads and minor corruption. */
export function loadData(): TrackerData {
  const primary = readFromStorage(localStorage, STORAGE_KEY)
  if (primary) return primary

  const backup = readFromStorage(localStorage, BACKUP_KEY)
  if (backup) {
    saveData(backup, { skipBackup: true })
    return backup
  }

  const session = readFromStorage(sessionStorage, SESSION_KEY)
  if (session) {
    saveData(session, { skipBackup: true })
    return session
  }

  return getDefaultData()
}

interface SaveOptions {
  skipBackup?: boolean
}

export function saveData(data: TrackerData, options: SaveOptions = {}): boolean {
  let json: string
  try {
    json = JSON.stringify(data)
  } catch {
    return false
  }

  const savedAt = new Date().toISOString()
  let ok = false

  try {
    localStorage.setItem(STORAGE_KEY, json)
    ok = true
  } catch {
    /* quota or private mode */
  }

  if (!options.skipBackup) {
    try {
      localStorage.setItem(BACKUP_KEY, json)
    } catch {
      /* best effort */
    }
  }

  try {
    sessionStorage.setItem(SESSION_KEY, json)
  } catch {
    /* best effort */
  }

  try {
    localStorage.setItem(META_KEY, JSON.stringify({ savedAt, version: 1 }))
  } catch {
    /* best effort */
  }

  return ok
}

export function getLastSavedAt(): string | null {
  try {
    const raw = localStorage.getItem(META_KEY)
    if (!raw) return null
    return (JSON.parse(raw) as { savedAt?: string }).savedAt ?? null
  } catch {
    return null
  }
}

export function exportData(data: TrackerData): string {
  return JSON.stringify(data, null, 2)
}

export function importData(json: string): TrackerData {
  const parsed = JSON.parse(json) as Partial<TrackerData>
  const merged = normalizeData(parsed)
  saveData(merged)
  return merged
}
