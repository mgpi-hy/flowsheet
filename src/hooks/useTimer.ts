import { useEffect, useRef, useCallback } from 'react'
import { useRound } from '../state/RoundContext'
import type { Side } from '../types'

export function useTimer() {
  const { state, dispatch } = useRound()
  const speechIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const prepIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined)

  const round = state.activeRoundId ? state.rounds[state.activeRoundId] : null
  const activeSpeech = round?.timer.speeches.find((s) => s.status === 'active')
  const activePrepSide = round?.timer.activePrepSide ?? null

  // Speech timer tick
  useEffect(() => {
    if (speechIntervalRef.current) clearInterval(speechIntervalRef.current)
    if (activeSpeech && activeSpeech.remaining > 0) {
      speechIntervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK_SPEECH' })
      }, 1000)
    }
    return () => {
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current)
    }
  }, [activeSpeech?.id, activeSpeech?.status, dispatch])

  // Prep timer tick
  useEffect(() => {
    if (prepIntervalRef.current) clearInterval(prepIntervalRef.current)
    if (activePrepSide) {
      prepIntervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK_PREP' })
      }, 1000)
    }
    return () => {
      if (prepIntervalRef.current) clearInterval(prepIntervalRef.current)
    }
  }, [activePrepSide, dispatch])

  const toggleSpeech = useCallback(
    (speechId: string) => {
      // Stop prep if running
      if (activePrepSide) {
        dispatch({ type: 'PAUSE_PREP' })
      }
      if (activeSpeech?.id === speechId) {
        dispatch({ type: 'PAUSE_SPEECH' })
      } else {
        dispatch({ type: 'START_SPEECH', payload: { speechId } })
      }
    },
    [activeSpeech, activePrepSide, dispatch]
  )

  const startPrep = useCallback(
    (side: Side) => {
      dispatch({ type: 'USE_PREP', payload: { side } })
    },
    [dispatch]
  )

  return {
    activeSpeech,
    activePrepSide,
    toggleSpeech,
    startPrep,
  }
}
