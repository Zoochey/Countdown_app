import type { DayCounter } from './types'

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
