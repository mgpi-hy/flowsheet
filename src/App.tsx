import { useEffect } from 'react'
import { RoundProvider, useRound } from './state/RoundContext'
import { TimerBar } from './components/TimerBar'
import { FlowGrid } from './components/FlowGrid'
import { BottomPanel } from './components/BottomPanel'
import { RoundList } from './components/RoundList'
import { exportRound } from './state/persistence'

function ActiveRound() {
  const { state, dispatch } = useRound()
  const round = state.activeRoundId ? state.rounds[state.activeRoundId] : null

  // Space to pause/resume active timer (only when not typing in an input/textarea)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.code === 'Space') {
        e.preventDefault()
        if (!round) return
        const active = round.timer.speeches.find((s) => s.status === 'active')
        if (active) {
          dispatch({ type: 'PAUSE_SPEECH' })
        } else if (round.timer.activePrepSide) {
          dispatch({ type: 'PAUSE_PREP' })
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [round, dispatch])

  if (!round) return null

  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch({ type: 'GO_TO_LIST' })}
            className="px-2 py-1 text-sm rounded border border-[var(--color-border)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] cursor-pointer"
          >
            Back
          </button>
          <span className="text-[var(--color-amber)] uppercase tracking-[0.3em] text-sm font-bold">FLOWSHEET</span>
          <span className="font-bold text-sm">
            <span className="text-[var(--color-aff)]">{round.affTeam}</span>
            {' v. '}
            <span className="text-[var(--color-neg)]">{round.negTeam}</span>
          </span>
          <span className="text-xs text-[var(--color-fg-dim)]">{round.format}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportRound(round)}
            className="px-2 py-1 text-xs rounded border border-[var(--color-border)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] cursor-pointer"
          >
            Export
          </button>
        </div>
      </div>

      {/* Timer */}
      <TimerBar />

      {/* Flow Grid */}
      <FlowGrid />

      {/* Bottom Panel */}
      <BottomPanel />
    </div>
  )
}

function AppContent() {
  const { state } = useRound()

  if (state.view === 'round' && state.activeRoundId) {
    return <ActiveRound />
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <RoundList />
    </div>
  )
}

function App() {
  return (
    <RoundProvider>
      <AppContent />
    </RoundProvider>
  )
}

export default App
