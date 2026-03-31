import type { AppState, Round, SpeechTimer } from '../types'
import type { Action } from './actions'
import { LD_SPEECHES, LD_PREP_TIME } from '../constants'

function createRound(id: string, format: 'LD', affTeam: string, negTeam: string): Round {
  const speeches: SpeechTimer[] = LD_SPEECHES.map((s) => ({
    ...s,
    remaining: s.duration,
    status: 'pending' as const,
  }))

  return {
    id,
    date: new Date().toISOString(),
    format,
    affTeam,
    negTeam,
    timer: {
      speeches,
      prepRemaining: { aff: LD_PREP_TIME, neg: LD_PREP_TIME },
      activePrepSide: null,
    },
    nodes: {},
    comments: {},
    rfd: '',
    decision: null,
  }
}

function updateActiveRound(state: AppState, updater: (round: Round) => Round): AppState {
  if (!state.activeRoundId) return state
  const round = state.rounds[state.activeRoundId]
  if (!round) return state
  return {
    ...state,
    rounds: {
      ...state.rounds,
      [state.activeRoundId]: updater(round),
    },
  }
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'CREATE_ROUND': {
      const round = createRound(
        action.payload.id,
        action.payload.format,
        action.payload.affTeam,
        action.payload.negTeam
      )
      return {
        ...state,
        rounds: { ...state.rounds, [round.id]: round },
        activeRoundId: round.id,
        view: 'round',
      }
    }

    case 'LOAD_ROUND':
      return { ...state, activeRoundId: action.payload.roundId, view: 'round' }

    case 'DELETE_ROUND': {
      const { [action.payload.roundId]: _, ...rest } = state.rounds
      return {
        ...state,
        rounds: rest,
        activeRoundId: state.activeRoundId === action.payload.roundId ? null : state.activeRoundId,
        view: state.activeRoundId === action.payload.roundId ? 'list' : state.view,
      }
    }

    case 'GO_TO_LIST':
      return { ...state, activeRoundId: null, view: 'list' }

    case 'ADD_NODE':
      return updateActiveRound(state, (round) => ({
        ...round,
        nodes: {
          ...round.nodes,
          [action.payload.id]: {
            id: action.payload.id,
            text: action.payload.text,
            parentId: action.payload.parentId,
            side: action.payload.side,
            status: 'live',
            column: action.payload.column,
            row: action.payload.row,
          },
        },
      }))

    case 'UPDATE_NODE_STATUS':
      return updateActiveRound(state, (round) => ({
        ...round,
        nodes: {
          ...round.nodes,
          [action.payload.nodeId]: {
            ...round.nodes[action.payload.nodeId],
            status: action.payload.status,
          },
        },
      }))

    case 'DELETE_NODE': {
      return updateActiveRound(state, (round) => {
        const { [action.payload.nodeId]: _, ...rest } = round.nodes
        return { ...round, nodes: rest }
      })
    }

    case 'START_SPEECH':
      return updateActiveRound(state, (round) => ({
        ...round,
        timer: {
          ...round.timer,
          speeches: round.timer.speeches.map((s) => ({
            ...s,
            status: s.id === action.payload.speechId ? 'active' : s.status === 'active' ? 'completed' : s.status,
          })),
        },
      }))

    case 'PAUSE_SPEECH':
      return updateActiveRound(state, (round) => ({
        ...round,
        timer: {
          ...round.timer,
          speeches: round.timer.speeches.map((s) => ({
            ...s,
            status: s.status === 'active' ? ('pending' as const) : s.status,
          })),
        },
      }))

    case 'RESUME_SPEECH':
      return state // handled by START_SPEECH with the same id

    case 'TICK_SPEECH':
      return updateActiveRound(state, (round) => ({
        ...round,
        timer: {
          ...round.timer,
          speeches: round.timer.speeches.map((s) =>
            s.status === 'active'
              ? { ...s, remaining: Math.max(0, s.remaining - 1) }
              : s
          ),
        },
      }))

    case 'COMPLETE_SPEECH':
      return updateActiveRound(state, (round) => ({
        ...round,
        timer: {
          ...round.timer,
          speeches: round.timer.speeches.map((s) =>
            s.id === action.payload.speechId ? { ...s, status: 'completed' as const } : s
          ),
        },
      }))

    case 'USE_PREP':
      return updateActiveRound(state, (round) => {
        const currentActive = round.timer.activePrepSide
        const newSide = currentActive === action.payload.side ? null : action.payload.side
        return {
          ...round,
          timer: {
            ...round.timer,
            activePrepSide: newSide,
            // Pause any active speech when starting prep
            speeches: newSide
              ? round.timer.speeches.map((s) =>
                  s.status === 'active' ? { ...s, status: 'pending' as const } : s
                )
              : round.timer.speeches,
          },
        }
      })

    case 'TICK_PREP':
      return updateActiveRound(state, (round) => {
        const side = round.timer.activePrepSide
        if (!side) return round
        const key = side === 'AFF' ? 'aff' : 'neg'
        const remaining = round.timer.prepRemaining[key]
        if (remaining <= 0) return { ...round, timer: { ...round.timer, activePrepSide: null } }
        return {
          ...round,
          timer: {
            ...round.timer,
            prepRemaining: {
              ...round.timer.prepRemaining,
              [key]: remaining - 1,
            },
          },
        }
      })

    case 'PAUSE_PREP':
      return updateActiveRound(state, (round) => ({
        ...round,
        timer: { ...round.timer, activePrepSide: null },
      }))

    case 'UPDATE_COMMENT':
      return updateActiveRound(state, (round) => ({
        ...round,
        comments: { ...round.comments, [action.payload.speechId]: action.payload.text },
      }))

    case 'UPDATE_RFD':
      return updateActiveRound(state, (round) => ({
        ...round,
        rfd: action.payload.text,
      }))

    case 'SET_DECISION':
      return updateActiveRound(state, (round) => ({
        ...round,
        decision: action.payload.decision,
      }))

    case 'IMPORT_ROUND':
      return {
        ...state,
        rounds: { ...state.rounds, [action.payload.round.id]: action.payload.round },
      }

    default:
      return state
  }
}

export const initialState: AppState = {
  rounds: {},
  activeRoundId: null,
  view: 'list',
}
