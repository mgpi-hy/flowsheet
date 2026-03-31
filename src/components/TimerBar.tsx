import { useRound } from '../state/RoundContext'
import { useTimer } from '../hooks/useTimer'
import type { SpeechTimer } from '../types'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function timerColor(speech: SpeechTimer): string {
  if (speech.status === 'completed') return 'opacity-50'
  if (speech.status !== 'active') return ''
  if (speech.remaining <= 10) return 'bg-[var(--color-blood)]/20 text-[var(--color-blood)] animate-pulse'
  if (speech.remaining <= 30) return 'bg-[var(--color-amber)]/20 text-[var(--color-amber)]'
  return 'bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]'
}

export function TimerBar() {
  const { state } = useRound()
  const { activePrepSide, toggleSpeech, startPrep } = useTimer()

  const round = state.activeRoundId ? state.rounds[state.activeRoundId] : null
  if (!round) return null

  return (
    <div className="flex items-center gap-1 p-2 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] overflow-x-auto">
      {round.timer.speeches.map((speech) => (
        <button
          key={speech.id}
          onClick={() => toggleSpeech(speech.id)}
          className={`
            px-3 py-1.5 rounded text-sm font-mono font-bold whitespace-nowrap
            transition-colors cursor-pointer select-none
            border border-[var(--color-border)]
            ${speech.status === 'active' ? timerColor(speech) : ''}
            ${speech.status === 'completed' ? 'opacity-40 line-through' : ''}
            ${speech.status === 'pending' ? 'bg-[var(--color-bg-tertiary)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]' : ''}
            ${speech.side === 'AFF' ? 'border-b-2 border-b-[var(--color-aff-border)]' : speech.side === 'NEG' ? 'border-b-2 border-b-[var(--color-neg-border)]' : ''}
          `}
          title={`${speech.name} - Click to ${speech.status === 'active' ? 'pause' : 'start'}`}
        >
          {speech.name} {formatTime(speech.remaining)}
        </button>
      ))}

      <div className="w-px h-8 bg-[var(--color-border)] mx-2" />

      <button
        onClick={() => startPrep('AFF')}
        className={`
          px-3 py-1.5 rounded text-sm font-mono font-bold whitespace-nowrap cursor-pointer
          border border-[var(--color-border)]
          ${activePrepSide === 'AFF' ? 'bg-[var(--color-aff-bg)] text-[var(--color-aff)] border-[var(--color-aff-border)]' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-aff-text)]'}
          ${round.timer.prepRemaining.aff <= 30 && round.timer.prepRemaining.aff > 10 ? 'ring-2 ring-[var(--color-amber)]' : ''}
          ${round.timer.prepRemaining.aff <= 10 ? 'ring-2 ring-[var(--color-blood)]' : ''}
        `}
      >
        Prep A {formatTime(round.timer.prepRemaining.aff)}
      </button>

      <button
        onClick={() => startPrep('NEG')}
        className={`
          px-3 py-1.5 rounded text-sm font-mono font-bold whitespace-nowrap cursor-pointer
          border border-[var(--color-border)]
          ${activePrepSide === 'NEG' ? 'bg-[var(--color-neg-bg)] text-[var(--color-neg)] border-[var(--color-neg-border)]' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-neg-text)]'}
          ${round.timer.prepRemaining.neg <= 30 && round.timer.prepRemaining.neg > 10 ? 'ring-2 ring-[var(--color-amber)]' : ''}
          ${round.timer.prepRemaining.neg <= 10 ? 'ring-2 ring-[var(--color-blood)]' : ''}
        `}
      >
        Prep N {formatTime(round.timer.prepRemaining.neg)}
      </button>
    </div>
  )
}
