import { useRound } from '../state/RoundContext'

export function CommentsTab() {
  const { state, dispatch } = useRound()
  const round = state.activeRoundId ? state.rounds[state.activeRoundId] : null
  if (!round) return null

  const activeSpeech = round.timer.speeches.find((s) => s.status === 'active')

  return (
    <div className="flex flex-col gap-2 p-3 h-full overflow-auto">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-fg-dim)]">
        Oral Critique Notes
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {round.timer.speeches.map((speech) => (
          <div key={speech.id} className="flex gap-2 items-start">
            <label
              className={`
                text-xs font-mono font-bold w-12 pt-2 text-right shrink-0
                ${activeSpeech?.id === speech.id ? 'text-[var(--color-cyan)]' : ''}
                ${speech.side === 'AFF' ? 'text-[var(--color-aff)]' : speech.side === 'NEG' ? 'text-[var(--color-neg)]' : 'text-[var(--color-fg-dim)]'}
              `}
            >
              {speech.name}
            </label>
            <textarea
              value={round.comments[speech.id] || ''}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_COMMENT',
                  payload: { speechId: speech.id, text: e.target.value },
                })
              }
              className={`
                flex-1 px-2 py-1 text-sm rounded border resize-none
                bg-[var(--color-bg-tertiary)] border-[var(--color-border)]
                text-[var(--color-fg)]
                focus:outline-none focus:ring-1 focus:ring-[var(--color-cyan)]
                ${activeSpeech?.id === speech.id ? 'ring-2 ring-[var(--color-cyan)]' : ''}
              `}
              rows={2}
              placeholder={`Notes for ${speech.name}...`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
