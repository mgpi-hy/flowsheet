import { useRef } from 'react'
import { useRound } from '../state/RoundContext'
import type { Decision } from '../types'

export function RFDTab() {
  const { state, dispatch } = useRound()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const round = state.activeRoundId ? state.rounds[state.activeRoundId] : null
  if (!round) return null

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const current = round.rfd
    const newText = current.slice(0, start) + text + current.slice(end)
    dispatch({ type: 'UPDATE_RFD', payload: { text: newText } })
    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + text.length
      ta.focus()
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey && e.key === 'a') {
      e.preventDefault()
      insertAtCursor('AFF')
    } else if (e.altKey && e.key === 'n') {
      e.preventDefault()
      insertAtCursor('NEG')
    }
  }

  const preloadFromFlow = () => {
    const nodes = Object.values(round.nodes)
    const flowedThrough = nodes.filter(
      (n) => n.column === 'flowsThrough' && n.status === 'live'
    )

    const affArgs = flowedThrough.filter((n) => n.row === 'AFF')
    const negArgs = flowedThrough.filter((n) => n.row === 'NEG')

    let skeleton = '=== REASON FOR DECISION ===\n\n'

    if (affArgs.length > 0) {
      skeleton += 'AFF surviving arguments:\n'
      affArgs.forEach((n) => {
        skeleton += `  - ${n.text} (${n.side})\n`
      })
      skeleton += '\n'
    }

    if (negArgs.length > 0) {
      skeleton += 'NEG surviving arguments:\n'
      negArgs.forEach((n) => {
        skeleton += `  - ${n.text} (${n.side})\n`
      })
      skeleton += '\n'
    }

    skeleton += 'Decision: \n'
    skeleton += 'Reason: \n'

    dispatch({ type: 'UPDATE_RFD', payload: { text: skeleton } })
  }

  return (
    <div className="flex flex-col gap-2 p-3 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-fg-dim)]">
          Reason for Decision
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={preloadFromFlow}
            className="px-2 py-1 text-xs font-bold rounded border border-[var(--color-border)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] cursor-pointer"
          >
            Pre-load from Flow
          </button>
          <span className="text-xs text-[var(--color-fg-dim)]">Alt+A = AFF | Alt+N = NEG</span>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-fg-dim)]">Decision:</span>
        {(['AFF', 'NEG'] as Decision[]).filter(Boolean).map((d) => (
          <button
            key={d}
            onClick={() => dispatch({ type: 'SET_DECISION', payload: { decision: d } })}
            className={`
              px-3 py-1 text-sm font-bold rounded cursor-pointer border
              ${round.decision === d
                ? d === 'AFF'
                  ? 'bg-[var(--color-aff-bg)] text-[var(--color-aff)] border-[var(--color-aff-border)]'
                  : 'bg-[var(--color-neg-bg)] text-[var(--color-neg)] border-[var(--color-neg-border)]'
                : 'border-[var(--color-border)] text-[var(--color-fg-dim)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]'
              }
            `}
          >
            {d}
          </button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={round.rfd}
        onChange={(e) => dispatch({ type: 'UPDATE_RFD', payload: { text: e.target.value } })}
        onKeyDown={handleKeyDown}
        className="flex-1 px-3 py-2 text-sm rounded border resize-none
          bg-[var(--color-bg-tertiary)] border-[var(--color-border)]
          text-[var(--color-fg)]
          focus:outline-none focus:ring-1 focus:ring-[var(--color-cyan)]
          min-h-[150px]"
        placeholder="Write your RFD here... (Alt+A for AFF, Alt+N for NEG)"
      />
    </div>
  )
}
