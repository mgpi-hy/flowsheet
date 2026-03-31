import { useState } from 'react'
import { useRound } from '../state/RoundContext'
import { COLUMNS } from '../constants'
import { FlowCell } from './FlowCell'
import type { Side, ColumnKey, FlowNode } from '../types'

interface PendingInput {
  parentId: string
  side: Side
  column: ColumnKey
  row: Side
}

export function FlowGrid() {
  const { state, dispatch } = useRound()
  const [pendingInput, setPendingInput] = useState<PendingInput | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const round = state.activeRoundId ? state.rounds[state.activeRoundId] : null
  if (!round) return null

  const allNodes = Object.values(round.nodes)

  const getNodes = (row: Side, column: ColumnKey): FlowNode[] => {
    return allNodes.filter((n) => n.row === row && n.column === column)
  }

  const handleGenerateChild = (parentId: string, side: Side, targetColumn: ColumnKey, targetRow: Side) => {
    setPendingInput({ parentId, side, column: targetColumn, row: targetRow })
  }

  const handleInputDone = () => {
    setPendingInput(null)
  }

  const handleSelect = (nodeId: string) => {
    setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId))
  }

  const handleDelete = (nodeId: string) => {
    dispatch({ type: 'DELETE_NODE', payload: { nodeId } })
    if (selectedNodeId === nodeId) setSelectedNodeId(null)
  }

  const rows: { side: Side; label: string }[] = [
    { side: 'AFF', label: round.affTeam || 'AFF' },
    { side: 'NEG', label: round.negTeam || 'NEG' },
  ]

  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] min-w-[800px]">
        {/* Header row */}
        <div className="p-2 font-bold text-[11px] uppercase tracking-widest bg-[var(--color-bg-secondary)] text-[var(--color-fg-dim)] border-b border-r border-[var(--color-border)]" />
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className="p-2 font-bold text-[11px] uppercase tracking-widest text-center bg-[var(--color-bg-secondary)] text-[var(--color-fg-dim)] border-b border-r border-[var(--color-border)]"
          >
            {col.label}
          </div>
        ))}

        {/* AFF and NEG rows */}
        {rows.map((row) => (
          <div key={row.side} className="contents">
            <div
              className={`
                p-2 font-bold text-sm flex items-start justify-center
                border-b border-r border-[var(--color-border)]
                ${row.side === 'AFF'
                  ? 'bg-[var(--color-aff-bg)] text-[var(--color-aff-text)]'
                  : 'bg-[var(--color-neg-bg)] text-[var(--color-neg-text)]'
                }
              `}
            >
              <div className="writing-mode-vertical">
                {row.label}
              </div>
            </div>
            {COLUMNS.map((col) => (
              <div
                key={`${row.side}-${col.key}`}
                className="border-b border-[var(--color-border)]"
              >
                <FlowCell
                  row={row.side}
                  column={col.key}
                  nodes={getNodes(row.side, col.key)}
                  onGenerateChild={handleGenerateChild}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                  selectedNodeId={selectedNodeId}
                  pendingInput={
                    pendingInput?.row === row.side && pendingInput?.column === col.key
                      ? pendingInput
                      : null
                  }
                  onInputDone={handleInputDone}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
