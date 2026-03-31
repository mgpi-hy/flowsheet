import { useState } from 'react'

const SHORTCUTS = [
  { keys: 'Click cell', desc: 'Add argument (constructive columns)' },
  { keys: 'Ctrl + Click node', desc: 'AFF responds in next column' },
  { keys: 'Ctrl + Right-click', desc: 'NEG responds in next column' },
  { keys: 'Click node', desc: 'Select node' },
  { keys: 'Right-click node', desc: 'Delete node' },
  { keys: 'Space', desc: 'Pause / resume active timer' },
  { keys: 'Enter', desc: 'Commit argument text' },
  { keys: 'Escape', desc: 'Cancel input' },
]

const FLOW_OPS = [
  { op: 'text\\', desc: 'Mark argument as dropped (dead)' },
  { op: 'text/', desc: 'Mark as flowed, auto-copy to next column' },
]

export function HelpButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-2 py-1 text-xs rounded border border-[var(--color-border)] text-[var(--color-fg-dim)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] cursor-pointer"
        title="Keyboard shortcuts & help"
      >
        ?
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-6 max-w-lg w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[var(--color-amber)] font-bold uppercase tracking-widest text-sm">
                How to Flow
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--color-fg-dim)] hover:text-[var(--color-fg)] cursor-pointer text-lg"
              >
                x
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-fg-dim)] mb-2">
                Controls
              </h3>
              <div className="flex flex-col gap-1.5">
                {SHORTCUTS.map((s) => (
                  <div key={s.keys} className="flex items-baseline gap-3 text-sm">
                    <span className="font-mono text-[var(--color-cyan)] whitespace-nowrap text-xs px-1.5 py-0.5 rounded bg-[var(--color-cyan)]/10 border border-[var(--color-cyan)]/20">
                      {s.keys}
                    </span>
                    <span className="text-[var(--color-fg-dim)]">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-fg-dim)] mb-2">
                Flow Operators
              </h3>
              <div className="flex flex-col gap-1.5">
                {FLOW_OPS.map((f) => (
                  <div key={f.op} className="flex items-baseline gap-3 text-sm">
                    <span className="font-mono text-[var(--color-amber)] whitespace-nowrap text-xs px-1.5 py-0.5 rounded bg-[var(--color-amber)]/10 border border-[var(--color-amber)]/20">
                      {f.op}
                    </span>
                    <span className="text-[var(--color-fg-dim)]">{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-fg-dim)] mb-2">
                Workflow
              </h3>
              <ol className="text-sm text-[var(--color-fg-dim)] list-decimal list-inside flex flex-col gap-1">
                <li>Click a constructive cell to add contentions</li>
                <li>Ctrl+Click nodes to flow AFF responses across columns</li>
                <li>Ctrl+Right-click to flow NEG responses</li>
                <li>End text with <span className="font-mono text-[var(--color-amber)]">\</span> to drop or <span className="font-mono text-[var(--color-amber)]">/</span> to flow through</li>
                <li>Use the timer bar to track speeches and prep time</li>
                <li>Write oral critique comments per speech in the bottom panel</li>
                <li>RFD tab pre-loads surviving arguments for your decision</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
