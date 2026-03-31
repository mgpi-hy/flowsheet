# FlowSheet — Judge's Debate Flowing Tool

## Overview

A React SPA for judges to flow debate rounds in real time. Tracks arguments across a four-column grid (Constructive → Attacks → Rebuttals → Flows Through/Weighing) with aff on top and neg on bottom. Includes per-speech timers, oral critique comments, and an RFD workspace that can pre-load surviving arguments.

LD format first, PF and Policy to follow.

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- useReducer + Context (no external state library)
- localStorage for persistence, JSON export/import
- PWA-capable (offline use at tournaments)
- No backend

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  TIMER BAR                                              │
│  [AC 6:00] [CX 3:00] [NC 7:00] ... [Prep AFF] [Prep NEG] │
├─────────────────────────────────────────────────────────┤
│            │ Constructive │ Attacks │ Rebuttals │ Flows/Weighing │
│  AFF       │              │         │           │                │
├────────────┼──────────────┼─────────┼───────────┼────────────────┤
│  NEG       │              │         │           │                │
├─────────────────────────────────────────────────────────┤
│  BOTTOM PANEL  [Comments] [RFD]  [Dark/Light toggle]    │
└─────────────────────────────────────────────────────────┘
```

## Flow Grid

### Structure

- Two rows: AFF (top), NEG (bottom)
- Four columns: Constructive, Attacks, Rebuttals, Flows Through / Weighing
- Each cell contains a vertical stack of argument nodes (small cards)
- Nodes are color-coded by side (aff color vs neg color) regardless of which row they appear in

### Interaction Model

**Adding initial arguments:**
- Click in a constructive cell, type, Enter to commit
- Each argument becomes a node in that cell

**Generating attacks/extensions:**
- Left-click a node → generates child in AFF's next column
- Right-click a node → generates child in NEG's next column
- Ctrl+Left / Ctrl+Right as keyboard fallback (no-mouse setups)
- Text input appears in the target cell, type response, Enter to commit

**Cross-side attacks:**
When aff attacks neg's constructive, left-click on neg's constructive node. The attack appears in neg's Attacks column, color-coded as aff's argument. Positional alignment shows what it targets.

### Flow Operators (typed at end of argument text)

- No suffix → sub-point, stays in current column beneath parent
- `\` → terminates; argument dies here (visually struck through / greyed)
- `/` → flows right to the next column (reference appears there)

## Timer

### LD Speech Order (pre-loaded)

| Speech | Time | Side |
|--------|------|------|
| AC | 6:00 | AFF |
| CX (neg asks) | 3:00 | — |
| NC | 7:00 | NEG |
| CX (aff asks) | 3:00 | — |
| 1AR | 4:00 | AFF |
| NR | 6:00 | NEG |
| 2AR | 3:00 | AFF |

### Prep Time
- 4:00 per side, independent countdowns
- Decremented separately from speech timers

### Behavior
- Manual advance: click or keybind to start each speech
- Space to pause/resume active timer
- Visual warning at 30s (yellow) and 10s (red)
- Current speech highlighted in timer bar

## Bottom Panel

### Comments Tab
- One text area per speech in the current format
- Active speech auto-selected based on timer state
- Free-form notes for oral critique
- Sorted in speech order

### RFD Tab
- Free-form text editor for Reason for Decision
- Alt+A macro-inserts "AFF"
- Alt+N macro-inserts "NEG"
- "Pre-load from flow" button: pulls all live nodes from column 3 (Flows Through / Weighing) into the RFD as a skeleton
- Decision field: AFF or NEG winner

## Data Model

```typescript
interface Round {
  id: string
  date: string
  format: "LD" // "PF" | "Policy" later
  affTeam: string
  negTeam: string
  timer: {
    speeches: SpeechTimer[]
    prepRemaining: { aff: number; neg: number }
  }
  flow: {
    aff: { constructive: Node[]; attacks: Node[]; rebuttals: Node[]; flowsThrough: Node[] }
    neg: { constructive: Node[]; attacks: Node[]; rebuttals: Node[]; flowsThrough: Node[] }
  }
  comments: Record<string, string> // keyed by speech id
  rfd: string
  decision: "AFF" | "NEG" | null
}

interface FlowNode {
  id: string
  text: string
  parentId: string | null
  side: "AFF" | "NEG"
  status: "live" | "dead" | "flowed"
  children: string[] // node IDs
}

interface SpeechTimer {
  id: string
  name: string
  duration: number // seconds
  remaining: number
  side: "AFF" | "NEG" | null
  status: "pending" | "active" | "completed"
}
```

## Persistence

- Auto-save to localStorage on every state change (debounced)
- Round list view: browse/load/delete saved rounds
- JSON export: download round as .json file
- JSON import: load .json file to review previous rounds

## Theming

- Dark mode and light mode
- Toggle in bottom panel or header
- Preference saved to localStorage
- Dark mode default? User toggles.

## Future (not in v1)

- PF format (different speech order/times)
- Policy format (8 speeches, different times)
- Cloud sync (Supabase or similar)
- Multiple flows per round (for Policy's multiple off-case positions)
