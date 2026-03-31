export type Side = 'AFF' | 'NEG'
export type Format = 'LD' | 'PF' | 'CX'
export type ColumnKey = 'constructive' | 'attacks' | 'rebuttals' | 'flowsThrough'
export type NodeStatus = 'live' | 'dead' | 'flowed'
export type SpeechStatus = 'pending' | 'active' | 'completed'
export type Decision = 'AFF' | 'NEG' | null

export interface FlowNode {
  id: string
  text: string
  parentId: string | null
  side: Side
  status: NodeStatus
  column: ColumnKey
  row: Side
}

export interface SpeechTimer {
  id: string
  name: string
  duration: number
  remaining: number
  side: Side | null
  status: SpeechStatus
}

export interface Round {
  id: string
  date: string
  format: Format
  affTeam: string
  negTeam: string
  timer: {
    speeches: SpeechTimer[]
    prepRemaining: { aff: number; neg: number }
    activePrepSide: Side | null
  }
  nodes: Record<string, FlowNode>
  comments: Record<string, string>
  rfd: string
  decision: Decision
}

export interface AppState {
  rounds: Record<string, Round>
  activeRoundId: string | null
  view: 'list' | 'round'
}
