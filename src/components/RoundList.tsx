import { useState, useRef } from 'react'
import { useRound } from '../state/RoundContext'
import { exportRound, importRound } from '../state/persistence'
import type { Format } from '../types'

const FORMATS: { value: Format; label: string; desc: string }[] = [
  { value: 'LD', label: 'LD', desc: 'Lincoln-Douglas' },
  { value: 'PF', label: 'PF', desc: 'Public Forum' },
  { value: 'CX', label: 'CX', desc: 'Policy' },
]

export function RoundList() {
  const { state, dispatch } = useRound()
  const [affTeam, setAffTeam] = useState('')
  const [negTeam, setNegTeam] = useState('')
  const [format, setFormat] = useState<Format>('LD')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const rounds = Object.values(state.rounds).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const handleCreate = () => {
    if (!affTeam.trim() || !negTeam.trim()) return
    dispatch({
      type: 'CREATE_ROUND',
      payload: {
        id: crypto.randomUUID(),
        format,
        affTeam: affTeam.trim(),
        negTeam: negTeam.trim(),
      },
    })
    setAffTeam('')
    setNegTeam('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate()
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const round = await importRound(file)
      dispatch({ type: 'IMPORT_ROUND', payload: { round } })
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-[var(--color-amber)] uppercase tracking-[0.3em] text-2xl font-bold mb-6">
        FLOWSHEET
      </h1>

      {/* New Round */}
      <div className="bg-[var(--color-bg-secondary)] rounded p-4 mb-6 border border-[var(--color-border)]">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-fg-dim)] mb-3">
          New Round
        </h2>
        <div className="flex gap-2 mb-3">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFormat(f.value)}
              className={`
                px-3 py-1.5 rounded text-sm font-bold cursor-pointer
                border transition-colors
                ${format === f.value
                  ? 'border-[var(--color-cyan)] text-[var(--color-cyan)] bg-[var(--color-cyan)]/10'
                  : 'border-[var(--color-border)] text-[var(--color-fg-dim)] hover:border-[var(--color-fg-dim)]'
                }
              `}
              title={f.desc}
            >
              {f.label}
            </button>
          ))}
          <span className="self-center text-xs text-[var(--color-fg-dim)]">
            {FORMATS.find((f) => f.value === format)?.desc}
          </span>
        </div>
        <div className="flex gap-2">
          <input
            value={affTeam}
            onChange={(e) => setAffTeam(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="AFF team/name"
            className="flex-1 px-3 py-2 rounded border border-[var(--color-aff-border)] bg-[var(--color-aff-bg)] text-[var(--color-fg)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-aff)]"
          />
          <span className="self-center text-[var(--color-fg-dim)] font-bold">v.</span>
          <input
            value={negTeam}
            onChange={(e) => setNegTeam(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="NEG team/name"
            className="flex-1 px-3 py-2 rounded border border-[var(--color-neg-border)] bg-[var(--color-neg-bg)] text-[var(--color-fg)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-neg)]"
          />
          <button
            onClick={handleCreate}
            className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-fg)] rounded font-bold text-sm hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] cursor-pointer"
          >
            Start
          </button>
        </div>
      </div>

      {/* Import */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 text-sm rounded border border-[var(--color-border)] text-[var(--color-fg-dim)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] cursor-pointer"
        >
          Import Round (.json)
        </button>
      </div>

      {/* Saved Rounds */}
      {rounds.length > 0 && (
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-fg-dim)] mb-3">
            Saved Rounds
          </h2>
          <div className="flex flex-col gap-2">
            {rounds.map((round) => (
              <div
                key={round.id}
                className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded border border-[var(--color-border)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[var(--color-fg-dim)]">
                    {new Date(round.date).toLocaleDateString()}
                  </span>
                  <span className="font-bold text-sm">
                    <span className="text-[var(--color-aff)]">{round.affTeam}</span>
                    {' v. '}
                    <span className="text-[var(--color-neg)]">{round.negTeam}</span>
                  </span>
                  <span className="text-xs text-[var(--color-fg-dim)]">{round.format}</span>
                  {round.decision && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        round.decision === 'AFF'
                          ? 'bg-[var(--color-aff-bg)] text-[var(--color-aff-text)] border border-[var(--color-aff-border)]'
                          : 'bg-[var(--color-neg-bg)] text-[var(--color-neg-text)] border border-[var(--color-neg-border)]'
                      }`}
                    >
                      {round.decision}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => dispatch({ type: 'LOAD_ROUND', payload: { roundId: round.id } })}
                    className="px-2 py-1 text-xs rounded border border-[var(--color-border)] text-[var(--color-cyan)] hover:border-[var(--color-cyan)] cursor-pointer"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => exportRound(round)}
                    className="px-2 py-1 text-xs rounded border border-[var(--color-border)] text-[var(--color-fg-dim)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] cursor-pointer"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${round.affTeam} v. ${round.negTeam}?`)) {
                        dispatch({ type: 'DELETE_ROUND', payload: { roundId: round.id } })
                      }
                    }}
                    className="px-2 py-1 text-xs rounded border border-[var(--color-border)] text-[var(--color-neg)] hover:border-[var(--color-neg)] cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
