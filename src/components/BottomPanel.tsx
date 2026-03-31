import { useState } from 'react'
import { CommentsTab } from './CommentsTab'
import { RFDTab } from './RFDTab'

type Tab = 'comments' | 'rfd'

export function BottomPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('comments')

  return (
    <div className="flex flex-col border-t border-[var(--color-border)] h-[280px]">
      <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        {([
          { id: 'comments' as Tab, label: 'COMMENTS' },
          { id: 'rfd' as Tab, label: 'RFD' },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2 text-[11px] font-bold uppercase tracking-widest cursor-pointer
              ${activeTab === tab.id
                ? 'bg-[var(--color-border)] text-[var(--color-cyan)]'
                : 'text-[var(--color-fg-dim)] hover:text-[var(--color-cyan)]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto bg-[var(--color-bg)]">
        {activeTab === 'comments' ? <CommentsTab /> : <RFDTab />}
      </div>
    </div>
  )
}
