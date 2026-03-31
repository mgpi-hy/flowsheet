import type { Side, ColumnKey, Decision, Format } from '../types'

export type Action =
  | { type: 'CREATE_ROUND'; payload: { id: string; format: Format; affTeam: string; negTeam: string } }
  | { type: 'LOAD_ROUND'; payload: { roundId: string } }
  | { type: 'DELETE_ROUND'; payload: { roundId: string } }
  | { type: 'GO_TO_LIST' }
  | { type: 'ADD_NODE'; payload: { id: string; text: string; side: Side; column: ColumnKey; row: Side; parentId: string | null } }
  | { type: 'UPDATE_NODE_STATUS'; payload: { nodeId: string; status: 'live' | 'dead' | 'flowed' } }
  | { type: 'DELETE_NODE'; payload: { nodeId: string } }
  | { type: 'START_SPEECH'; payload: { speechId: string } }
  | { type: 'PAUSE_SPEECH' }
  | { type: 'RESUME_SPEECH' }
  | { type: 'TICK_SPEECH' }
  | { type: 'COMPLETE_SPEECH'; payload: { speechId: string } }
  | { type: 'USE_PREP'; payload: { side: Side } }
  | { type: 'PAUSE_PREP' }
  | { type: 'TICK_PREP' }
  | { type: 'UPDATE_COMMENT'; payload: { speechId: string; text: string } }
  | { type: 'UPDATE_RFD'; payload: { text: string } }
  | { type: 'SET_DECISION'; payload: { decision: Decision } }
  | { type: 'IMPORT_ROUND'; payload: { round: import('../types').Round } }
