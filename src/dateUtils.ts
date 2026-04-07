import { MILESTONE_DAYS } from './types'

/** Parse YYYY-MM-DD as local midnight */
export function parseLocalDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Whole calendar days from start (local) to today (local). */
export function daysSinceStart(startYmd: string): number {
  const start = parseLocalDate(startYmd)
  start.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((today.getTime() - start.getTime()) / 86_400_000)
}

export function addCalendarDays(startYmd: string, days: number): Date {
  const d = parseLocalDate(startYmd)
  d.setDate(d.getDate() + days)
  d.setHours(0, 0, 0, 0)
  return d
}

export function nextMilestoneDay(currentDays: number): number | null {
  for (const m of MILESTONE_DAYS) {
    if (m > currentDays) return m
  }
  return null
}

/** YYYYMMDD for ICS all-day */
function icsDateOnly(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

export function buildMilestoneIcs(
  title: string,
  startYmd: string,
  milestoneDay: number,
): string {
  const eventDay = addCalendarDays(startYmd, milestoneDay)
  const dtStart = icsDateOnly(eventDay)
  const endExclusive = new Date(eventDay)
  endExclusive.setDate(endExclusive.getDate() + 1)
  const dtEnd = icsDateOnly(endExclusive)
  const uid = `${startYmd}-${milestoneDay}-${Date.now()}@zoochey`
  const summary = `${title}: ${milestoneDay.toLocaleString('en-US')} days`
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z/, 'Z')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zoochey//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(`Milestone reached: ${milestoneDay} days since ${startYmd}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function escapeIcsText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export function downloadIcs(filename: string, body: string): void {
  const blob = new Blob([body], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
