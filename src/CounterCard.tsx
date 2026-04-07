import { useState } from 'react'
import type { CSSProperties } from 'react'
import {
  addCalendarDays,
  buildMilestoneIcs,
  daysSinceStart,
  downloadIcs,
  nextMilestoneDay,
} from './dateUtils'
import type { DayCounter, ThemeId } from './types'
import { MILESTONE_DAYS, THEMES } from './types'

type Props = {
  item: DayCounter
  onChange: (next: DayCounter) => void
  onRemove: () => void
}

export function CounterCard({ item, onChange, onRemove }: Props) {
  const theme = THEMES[item.themeId]
  const days = daysSinceStart(item.startDate)
  const nextM = nextMilestoneDay(days)
  const daysToNext = nextM !== null ? nextM - days : null
  const [expanded, setExpanded] = useState(false)

  const setTheme = (themeId: ThemeId) => onChange({ ...item, themeId })

  return (
    <article
      className="counter-card"
      style={
        {
          '--card-bg': theme.card,
          '--accent': theme.accent,
          '--text': theme.text,
          '--muted': theme.muted,
        } as CSSProperties
      }
    >
      <header className="counter-card__head">
        <h2 className="counter-card__title">{item.title}</h2>
        <div className="counter-card__actions">
          <select
            className="counter-card__theme"
            value={item.themeId}
            onChange={(e) => setTheme(e.target.value as ThemeId)}
            aria-label="Color scheme"
          >
            {(Object.keys(THEMES) as ThemeId[]).map((id) => (
              <option key={id} value={id}>
                {THEMES[id].label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="counter-card__remove"
            onClick={onRemove}
            aria-label={`Remove ${item.title}`}
          >
            ×
          </button>
        </div>
      </header>

      <p className="counter-card__date">
        Since{' '}
        <time dateTime={item.startDate}>
          {formatDisplayDate(item.startDate)}
        </time>
      </p>

      <div className="counter-card__circle-wrap">
        <div className="counter-card__circle" aria-label={`${days} days`}>
          <span className="counter-card__number">{formatDays(days)}</span>
          <span className="counter-card__unit">days</span>
        </div>
      </div>

      <button
        type="button"
        className="counter-card__toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {expanded ? 'Hide milestones' : 'Show milestones'}
      </button>

      {expanded && (
        <section className="counter-card__milestones" aria-label="Milestones">
        <h3 className="counter-card__milestones-title">Milestones</h3>
        <ul className="counter-card__milestone-list">
          {MILESTONE_DAYS.map((m) => {
            const hit = days >= m
            const when = addCalendarDays(item.startDate, m)
            return (
              <li key={m} className={hit ? 'is-hit' : ''}>
                <span className="counter-card__milestone-n">
                  {m.toLocaleString('en-US')} d
                </span>
                <span className="counter-card__milestone-when">
                  {hit ? '✓ reached' : `→ ${formatShortDate(when)}`}
                </span>
                {!hit && (
                  <button
                    type="button"
                    className="counter-card__ics"
                    onClick={() =>
                      downloadIcs(
                        `${slug(item.title)}-${m}-days.ics`,
                        buildMilestoneIcs(item.title, item.startDate, m),
                      )
                    }
                  >
                    .ics
                  </button>
                )}
              </li>
            )
          })}
        </ul>
        {nextM !== null && daysToNext !== null && (
          <p className="counter-card__next">
            <strong>{daysToNext.toLocaleString('en-US')}</strong> days until{' '}
            <strong>{nextM.toLocaleString('en-US')}</strong>
          </p>
        )}
        {nextM === null && (
          <p className="counter-card__next">Past all listed milestones 🎉</p>
        )}
        </section>
      )}
    </article>
  )
}

function formatDays(n: number): string {
  return n.toLocaleString('en-US')
}

function formatDisplayDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 40) || 'event'
}
