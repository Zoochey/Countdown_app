import type { DayCounter } from './types'
import { THEMES } from './types'

const STORAGE_KEY = 'day-counters-v1'
const META_KEY = 'day-counters-meta-v1'

export interface AppMeta {
  lastSeenDays: Record<string, number>
}

export function loadCounters(): DayCounter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed as DayCounter[]
  } catch {
    return []
  }
}

export function saveCounters(items: DayCounter[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function loadMeta(): AppMeta {
  try {
    const raw = localStorage.getItem(META_KEY)
    if (!raw) return { lastSeenDays: {} }
    const parsed = JSON.parse(raw) as AppMeta
    return {
      lastSeenDays:
        parsed.lastSeenDays && typeof parsed.lastSeenDays === 'object'
          ? parsed.lastSeenDays
          : {},
    }
  } catch {
    return { lastSeenDays: {} }
  }
}

export function saveMeta(meta: AppMeta): void {
  localStorage.setItem(META_KEY, JSON.stringify(meta))
}

export interface BackupFileV1 {
  version: 1
  exportedAt: string
  counters: DayCounter[]
}

export function exportCountersBackup(counters: DayCounter[]): string {
  const payload: BackupFileV1 = {
    version: 1,
    exportedAt: new Date().toISOString(),
    counters,
  }
  return JSON.stringify(payload, null, 2)
}

export function importCountersBackup(raw: string): DayCounter[] {
  const parsed = JSON.parse(raw) as unknown
  const items = Array.isArray(parsed)
    ? parsed
    : isBackupV1(parsed)
      ? parsed.counters
      : null

  if (!Array.isArray(items)) {
    throw new Error('Backup file is invalid.')
  }

  const validThemeIds = new Set(Object.keys(THEMES))

  return items.map((item, i) => {
    const x = item as Partial<DayCounter>
    const title =
      typeof x.title === 'string' && x.title.trim().length > 0
        ? x.title.trim()
        : `Imported item ${i + 1}`
    const startDate =
      typeof x.startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x.startDate)
        ? x.startDate
        : '2000-01-01'
    const themeId =
      typeof x.themeId === 'string' && validThemeIds.has(x.themeId) ? x.themeId : 'ocean'

    return {
      id: typeof x.id === 'string' && x.id ? x.id : `imported-${Date.now()}-${i}`,
      title,
      startDate,
      themeId,
    }
  })
}

function isBackupV1(value: unknown): value is BackupFileV1 {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    (value as { version?: unknown }).version === 1 &&
    'counters' in value &&
    Array.isArray((value as { counters?: unknown }).counters)
  )
}
