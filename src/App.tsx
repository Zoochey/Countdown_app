import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { CounterCard } from './CounterCard'
import { daysSinceStart } from './dateUtils'
import {
  exportCountersBackup,
  importCountersBackup,
  loadCounters,
  loadMeta,
  saveCounters,
  saveMeta,
} from './storage'
import type { DayCounter, ThemeId } from './types'
import { MILESTONE_DAYS } from './types'

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export default function App() {
  const [counters, setCounters] = useState<DayCounter[]>(() => loadCounters())
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [backupNotice, setBackupNotice] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDate, setDraftDate] = useState(() => todayYmd())
  const [draftTheme, setDraftTheme] = useState<ThemeId>('ocean')
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    saveCounters(counters)
  }, [counters])

  useEffect(() => {
    const meta = loadMeta()
    const nextSeen = { ...meta.lastSeenDays }
    const lines: string[] = []

    for (const c of counters) {
      const d = daysSinceStart(c.startDate)
      const prev = nextSeen[c.id]
      if (prev === undefined) {
        nextSeen[c.id] = d
        continue
      }
      if (d > prev) {
        for (const m of MILESTONE_DAYS) {
          if (prev < m && d >= m) {
            lines.push(`${c.title}: ${m.toLocaleString('en-US')} days 🎉`)
          }
        }
      }
      nextSeen[c.id] = d
    }

    saveMeta({ lastSeenDays: nextSeen })
    if (lines.length) setToast(lines.join('\n'))
  }, [counters])

  const openModal = useCallback(() => {
    setDraftTitle('')
    setDraftDate(todayYmd())
    setDraftTheme('ocean')
    setModalOpen(true)
  }, [])

  const addCounter = useCallback(() => {
    const title = draftTitle.trim() || 'Untitled'
    setCounters((prev) => [
      ...prev,
      {
        id: newId(),
        title,
        startDate: draftDate,
        themeId: draftTheme,
      },
    ])
    setModalOpen(false)
  }, [draftTitle, draftDate, draftTheme])

  const exportBackup = useCallback(() => {
    const body = exportCountersBackup(counters)
    const stamp = new Date().toISOString().slice(0, 10)
    downloadTextFile(`zoochey-backup-${stamp}.json`, body, 'application/json')
    setBackupNotice(`Backup exported (${counters.length.toLocaleString('en-US')} items).`)
  }, [counters])

  const openImportPicker = useCallback(() => {
    importInputRef.current?.click()
  }, [])

  const onImportFile = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const imported = importCountersBackup(text)
      setCounters(imported)
      setBackupNotice(`Backup imported (${imported.length.toLocaleString('en-US')} items).`)
    } catch {
      setBackupNotice('Import failed. Please choose a valid backup JSON file.')
    } finally {
      event.target.value = ''
    }
  }, [])

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-tools">
          <button type="button" className="btn btn--ghost" onClick={exportBackup}>
            Export backup
          </button>
          <button type="button" className="btn btn--ghost" onClick={openImportPicker}>
            Import backup
          </button>
          <input
            ref={importInputRef}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={onImportFile}
          />
        </div>
        <p className="app__wordmark">Zoochey</p>
        <h1 className="app__title">Countdown timer</h1>
        <p className="app__subtitle">
          Birthdays, anniversaries, streaks — each visit starts fresh on this
          device; nothing is stored in the cloud.
        </p>
        {backupNotice && <p className="app__backup-notice">{backupNotice}</p>}
      </header>

      <main className="app__main">
        {counters.length === 0 ? (
          <p className="app__empty">
            No counters yet. Tap <strong>+</strong> to add one (try a birthday
            or start date).
          </p>
        ) : (
          <div className="app__grid">
            {counters.map((c) => (
              <CounterCard
                key={c.id}
                item={c}
                onChange={(next) =>
                  setCounters((prev) => prev.map((x) => (x.id === c.id ? next : x)))
                }
                onRemove={() =>
                  setCounters((prev) => prev.filter((x) => x.id !== c.id))
                }
              />
            ))}
          </div>
        )}
      </main>

      <footer className="app__footer">
        <span className="app__footer-brand">Zoochey</span>
        <span className="app__footer-note">Private to this browser · add your own dates</span>
      </footer>

      <button
        type="button"
        className="fab"
        onClick={openModal}
        aria-label="Add counter"
      >
        +
      </button>

      {modalOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="modal-title" className="modal__title">
              New counter
            </h2>
            <label className="field">
              <span className="field__label">Label</span>
              <input
                className="field__input"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="e.g. Craig’s birthday"
                autoFocus
              />
            </label>
            <label className="field">
              <span className="field__label">Start date</span>
              <input
                className="field__input"
                type="date"
                value={draftDate}
                onChange={(e) => setDraftDate(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field__label">Color scheme</span>
              <select
                className="field__input"
                value={draftTheme}
                onChange={(e) => setDraftTheme(e.target.value as ThemeId)}
              >
                <option value="ocean">Ocean</option>
                <option value="sunset">Sunset</option>
                <option value="forest">Forest</option>
                <option value="plum">Plum</option>
                <option value="slate">Slate</option>
                <option value="ember">Ember</option>
              </select>
            </label>
            <div className="modal__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button type="button" className="btn btn--primary" onClick={addCounter}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          <div className="toast__body">
            <strong className="toast__head">Milestone</strong>
            <pre className="toast__text">{toast}</pre>
          </div>
          <button
            type="button"
            className="toast__close"
            onClick={() => setToast(null)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

function todayYmd(): string {
  const t = new Date()
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const d = String(t.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function downloadTextFile(filename: string, body: string, mimeType: string): void {
  const blob = new Blob([body], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
