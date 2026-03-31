import type { SpeechTimer, ColumnKey } from './types'

export const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: 'constructive', label: 'Constructive' },
  { key: 'attacks', label: 'Attacks' },
  { key: 'rebuttals', label: 'Rebuttals' },
  { key: 'flowsThrough', label: 'Flows Through / Weighing' },
]

export const LD_SPEECHES: Omit<SpeechTimer, 'remaining' | 'status'>[] = [
  { id: 'ac', name: 'AC', duration: 360, side: 'AFF' },
  { id: 'cx1', name: 'CX', duration: 180, side: null },
  { id: 'nc', name: 'NC', duration: 420, side: 'NEG' },
  { id: 'cx2', name: 'CX', duration: 180, side: null },
  { id: '1ar', name: '1AR', duration: 240, side: 'AFF' },
  { id: 'nr', name: 'NR', duration: 360, side: 'NEG' },
  { id: '2ar', name: '2AR', duration: 180, side: 'AFF' },
]

export const LD_PREP_TIME = 240 // 4 minutes per side

export const COLUMN_ORDER: ColumnKey[] = [
  'constructive',
  'attacks',
  'rebuttals',
  'flowsThrough',
]

export const NEXT_COLUMN: Record<ColumnKey, ColumnKey | null> = {
  constructive: 'attacks',
  attacks: 'rebuttals',
  rebuttals: 'flowsThrough',
  flowsThrough: null,
}
