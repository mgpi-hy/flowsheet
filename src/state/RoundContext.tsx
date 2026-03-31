import { createContext, useContext, useReducer, useEffect, useCallback, useRef, type ReactNode } from 'react'
import type { AppState } from '../types'
import type { Action } from './actions'
import { reducer, initialState } from './reducer'
import { loadState, saveState } from './persistence'

interface RoundContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const RoundContext = createContext<RoundContextValue | null>(null)

export function RoundProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    const saved = loadState()
    return saved ? { ...init, ...saved } : init
  })

  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const debouncedSave = useCallback((s: AppState) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => saveState(s), 300)
  }, [])

  useEffect(() => {
    debouncedSave(state)
  }, [state, debouncedSave])

  return (
    <RoundContext.Provider value={{ state, dispatch }}>
      {children}
    </RoundContext.Provider>
  )
}

export function useRound() {
  const ctx = useContext(RoundContext)
  if (!ctx) throw new Error('useRound must be used within RoundProvider')
  return ctx
}
