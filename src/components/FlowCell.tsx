import { useState } from 'react'
import type { FlowNode, Side, ColumnKey } from '../types'
import { FlowNodeComponent, NodeInput } from './FlowNode'
import { useRound } from '../state/RoundContext'
import { NEXT_COLUMN } from '../constants'

interface PendingInput {
  parentId: string
  side: Side
  column: ColumnKey
  row: Side
}

interface FlowCellProps {
  row: Side
  column: ColumnKey
  nodes: FlowNode[]
  onGenerateChild: (parentId: string, side: Side, targetColumn: ColumnKey, targetRow: Side) => void
  onSelect: (nodeId: string) => void
  onDelete: (nodeId: string) => void
  selectedNodeId: string | null
  pendingInput: PendingInput | null
  onInputDone: () => void
}

export function FlowCell({ row, column, nodes, onGenerateChild, onSelect, onDelete, selectedNodeId, pendingInput, onInputDone }: FlowCellProps) {
  const { dispatch } = useRound()
  const [localInput, setLocalInput] = useState(false)

  const handleCellClick = () => {
    if (column !== 'constructive') return
    if (localInput || pendingInput) return
    setLocalInput(true)
  }

  const handleCommit = (text: string, parentId: string | null, side: Side) => {
    let finalText = text
    let nodeStatus: 'live' | 'dead' | 'flowed' = 'live'

    // Parse flow operators
    if (text.endsWith('\\')) {
      finalText = text.slice(0, -1).trim()
      nodeStatus = 'dead'
    } else if (text.endsWith('/')) {
      finalText = text.slice(0, -1).trim()
      nodeStatus = 'flowed'
    }

    if (!finalText) {
      setLocalInput(false)
      onInputDone()
      return
    }

    const nodeId = crypto.randomUUID()

    dispatch({
      type: 'ADD_NODE',
      payload: {
        id: nodeId,
        text: finalText,
        side,
        column,
        row,
        parentId,
      },
    })

    if (nodeStatus === 'dead') {
      dispatch({
        type: 'UPDATE_NODE_STATUS',
        payload: { nodeId, status: 'dead' },
      })
    } else if (nodeStatus === 'flowed') {
      dispatch({
        type: 'UPDATE_NODE_STATUS',
        payload: { nodeId, status: 'flowed' },
      })
      const nextCol = NEXT_COLUMN[column]
      if (nextCol) {
        dispatch({
          type: 'ADD_NODE',
          payload: {
            id: crypto.randomUUID(),
            text: finalText,
            side,
            column: nextCol,
            row,
            parentId: nodeId,
          },
        })
      }
    }

    setLocalInput(false)
    onInputDone()
  }

  const handleCancel = () => {
    setLocalInput(false)
    onInputDone()
  }

  // Build tree-ordered list
  const rootNodes = nodes.filter((n) => !n.parentId || !nodes.find((p) => p.id === n.parentId))
  const orderedNodes: FlowNode[] = []
  for (const root of rootNodes) {
    orderedNodes.push(root)
    const children = nodes.filter((c) => c.parentId === root.id)
    orderedNodes.push(...children)
  }
  // Add any remaining nodes not yet included
  for (const node of nodes) {
    if (!orderedNodes.includes(node)) orderedNodes.push(node)
  }

  const showInput = localInput || pendingInput
  const inputSide = pendingInput?.side ?? row
  const inputParentId = pendingInput?.parentId ?? null

  return (
    <div
      className={`
        min-h-[120px] p-2 border-r border-[var(--color-border)]
        flex flex-col gap-1
        ${column === 'constructive' && !showInput ? 'cursor-text' : 'cursor-default'}
      `}
      onClick={handleCellClick}
    >
      {orderedNodes.map((node) => (
        <FlowNodeComponent
          key={node.id}
          node={node}
          onGenerateChild={onGenerateChild}
          onSelect={onSelect}
          onDelete={onDelete}
          isSelected={selectedNodeId === node.id}
        />
      ))}
      {orderedNodes.length === 0 && !showInput && column === 'constructive' && (
        <span className="text-[var(--color-fg-dim)] text-xs italic opacity-50 select-none">
          click to add contention
        </span>
      )}
      {showInput && (
        <NodeInput
          onCommit={(text) => handleCommit(text, inputParentId, inputSide)}
          onCancel={handleCancel}
          side={inputSide}
        />
      )}
    </div>
  )
}
