import { useState, useRef, useEffect } from 'react'
import type { FlowNode as FlowNodeType, Side, ColumnKey } from '../types'
import { NEXT_COLUMN } from '../constants'

interface FlowNodeProps {
  node: FlowNodeType
  onGenerateChild: (parentId: string, side: Side, targetColumn: ColumnKey, targetRow: Side) => void
  onSelect: (nodeId: string) => void
  onDelete: (nodeId: string) => void
  isSelected: boolean
}

export function FlowNodeComponent({ node, onGenerateChild, onSelect, onDelete, isSelected }: FlowNodeProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.ctrlKey) {
      // Ctrl+Left-click = AFF generates child in next column
      const nextCol = NEXT_COLUMN[node.column]
      if (!nextCol) return
      onGenerateChild(node.id, 'AFF', nextCol, node.row)
    } else {
      // Plain click = select
      onSelect(node.id)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.ctrlKey) {
      // Ctrl+Right-click = NEG generates child in next column
      const nextCol = NEXT_COLUMN[node.column]
      if (!nextCol) return
      onGenerateChild(node.id, 'NEG', nextCol, node.row)
    } else {
      // Plain right-click = delete
      onDelete(node.id)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const nextCol = NEXT_COLUMN[node.column]
    if (!nextCol) return

    if (e.ctrlKey && e.key === 'ArrowLeft') {
      e.preventDefault()
      onGenerateChild(node.id, 'AFF', nextCol, node.row)
    } else if (e.ctrlKey && e.key === 'ArrowRight') {
      e.preventDefault()
      onGenerateChild(node.id, 'NEG', nextCol, node.row)
    }
  }

  return (
    <div
      className={`
        px-2 py-1 rounded text-sm cursor-pointer select-none
        border transition-all
        ${node.status === 'dead' ? 'opacity-40 line-through text-[var(--color-fg-dim)]' : ''}
        ${node.status === 'flowed' ? 'border-dashed' : 'border-solid'}
        ${node.side === 'AFF'
          ? 'bg-[var(--color-aff-bg)] border-[var(--color-aff-border)] text-[var(--color-aff-text)]'
          : 'bg-[var(--color-neg-bg)] border-[var(--color-neg-border)] text-[var(--color-neg-text)]'
        }
        ${isSelected ? 'ring-2 ring-[var(--color-amber)]' : 'hover:ring-2 hover:ring-[var(--color-fg-dim)]'}
        ${node.parentId ? 'ml-3' : ''}
      `}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      title="Click: select | Right-click: delete | Ctrl+Click: AFF responds | Ctrl+Right-click: NEG responds"
    >
      {node.status === 'flowed' && <span className="mr-1 text-xs">/</span>}
      {node.text}
      {node.status === 'dead' && <span className="ml-1 text-xs">\</span>}
    </div>
  )
}

interface NodeInputProps {
  onCommit: (text: string) => void
  onCancel: () => void
  side: Side
}

export function NodeInput({ onCommit, onCancel, side }: NodeInputProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && text.trim()) {
      e.preventDefault()
      onCommit(text.trim())
      setText('')
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <input
      ref={inputRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={onCancel}
      className={`
        w-full px-2 py-1 rounded text-sm border-2 outline-none
        bg-[var(--color-bg-tertiary)] text-[var(--color-fg)]
        ${side === 'AFF'
          ? 'border-[var(--color-aff-border)]'
          : 'border-[var(--color-neg-border)]'
        }
      `}
      placeholder="Type argument, Enter to add"
    />
  )
}
