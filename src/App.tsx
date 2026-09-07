import { useEffect, useRef } from 'react'
import { RoundProvider, useRound } from './state/RoundContext'
import { TimerBar } from './components/TimerBar'
import { FlowGrid } from './components/FlowGrid'
import { BottomPanel } from './components/BottomPanel'
import { RoundList } from './components/RoundList'
import { exportRound } from './state/persistence'
import { HelpButton } from './components/HelpOverlay'
import { TuiShell, TuiHeader } from './components/TuiShell'

function ActiveRound() {
  const { state, dispatch } = useRound()
  const round = state.activeRoundId ? state.rounds[state.activeRoundId] : null

  // Space to pause/resume active timer (only when not typing in an input/textarea)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.defaultPrevented || (e.target as HTMLElement)?.closest('input, textarea, select, button, a, [contenteditable="true"], dialog, [role="dialog"]')) return
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
    <div className="flex flex-col flex-1 min-h-0 bg-[var(--color-bg)] text-[var(--color-fg)]">
      {/* Header */}
      <TuiHeader appName="flowsheet">
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch({ type: 'GO_TO_LIST' })}
            className="px-2 py-1 text-sm rounded border border-[var(--color-border)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] cursor-pointer"
          >
            Back
          </button>
          <span className="font-bold text-sm">
            <span className="text-[var(--color-aff)]">{round.affTeam}</span>
            {' v. '}
            <span className="text-[var(--color-neg)]">{round.negTeam}</span>
          </span>
          <span className="text-xs text-[var(--color-fg-dim)]">{round.format}</span>
        </div>
        <div className="flex items-center gap-2">
          <HelpButton />
          <button
            onClick={() => exportRound(round)}
            className="px-2 py-1 text-xs rounded border border-[var(--color-border)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] cursor-pointer"
          >
            Export
          </button>
        </div>
      </TuiHeader>

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
  const workspaceRef = useRef<HTMLDivElement>(null)
  return <div className="project-app">
    <div className="flex flex-col flex-1 min-h-0 outline-none" ref={workspaceRef} tabIndex={-1}>
      {state.view === 'round' && state.activeRoundId ? <ActiveRound /> : <>
        <TuiHeader appName="flowsheet"><span>rounds / index</span></TuiHeader>
        <main className="flowsheet-list"><RoundList /></main>
      </>}
    </div>
    <TuiShell appName="flowsheet" panes={[{ name: 'round', ref: workspaceRef }]} shortcuts={[{ category: 'Flow', items: [{ keys: ['Enter'], description: 'Commit argument text' }, { keys: ['Escape'], description: 'Cancel argument input' }, { keys: ['Ctrl+click'], description: 'AFF responds in the next column' }, { keys: ['Ctrl+right-click'], description: 'NEG responds in the next column' }, { keys: ['Space'], description: 'Pause active speech or prep timer' }] }]} />
  </div>
}

function App() {
  return (
    <RoundProvider>
      <AppContent />
    </RoundProvider>
  )
}

export default App
