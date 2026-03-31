import type { SpeechTimer, ColumnKey, Format } from './types'

export const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: 'constructive', label: 'Constructive' },
  { key: 'attacks', label: 'Attacks' },
  { key: 'rebuttals', label: 'Rebuttals' },
  { key: 'flowsThrough', label: 'Flows Through / Weighing' },
]

type SpeechDef = Omit<SpeechTimer, 'remaining' | 'status'>

export const LD_SPEECHES: SpeechDef[] = [
  { id: 'ac', name: 'AC', duration: 360, side: 'AFF' },
  { id: 'cx1', name: 'CX N→A', duration: 180, side: null },
  { id: 'nc', name: 'NC', duration: 420, side: 'NEG' },
  { id: 'cx2', name: 'CX A→N', duration: 180, side: null },
  { id: '1ar', name: '1AR', duration: 240, side: 'AFF' },
  { id: 'nr', name: 'NR', duration: 360, side: 'NEG' },
  { id: '2ar', name: '2AR', duration: 180, side: 'AFF' },
]

export const PF_SPEECHES: SpeechDef[] = [
  { id: 'con1', name: 'Con 1', duration: 240, side: 'AFF' },
  { id: 'con2', name: 'Con 2', duration: 240, side: 'NEG' },
  { id: 'cf1', name: 'CF', duration: 180, side: null },
  { id: 'reb1', name: 'Reb 1', duration: 240, side: 'AFF' },
  { id: 'reb2', name: 'Reb 2', duration: 240, side: 'NEG' },
  { id: 'cf2', name: 'CF', duration: 180, side: null },
  { id: 'sum1', name: 'Sum 1', duration: 180, side: 'AFF' },
  { id: 'sum2', name: 'Sum 2', duration: 180, side: 'NEG' },
  { id: 'gcf', name: 'GCF', duration: 180, side: null },
  { id: 'ff1', name: 'FF 1', duration: 120, side: 'AFF' },
  { id: 'ff2', name: 'FF 2', duration: 120, side: 'NEG' },
]

export const CX_SPEECHES: SpeechDef[] = [
  { id: '1ac', name: '1AC', duration: 480, side: 'AFF' },
  { id: 'cx1ac', name: 'CX 1AC', duration: 180, side: null },
  { id: '1nc', name: '1NC', duration: 480, side: 'NEG' },
  { id: 'cx1nc', name: 'CX 1NC', duration: 180, side: null },
  { id: '2ac', name: '2AC', duration: 480, side: 'AFF' },
  { id: 'cx2ac', name: 'CX 2AC', duration: 180, side: null },
  { id: '2nc', name: '2NC', duration: 480, side: 'NEG' },
  { id: 'cx2nc', name: 'CX 2NC', duration: 180, side: null },
  { id: '1nr', name: '1NR', duration: 300, side: 'NEG' },
  { id: '1ar', name: '1AR', duration: 300, side: 'AFF' },
  { id: '2nr', name: '2NR', duration: 300, side: 'NEG' },
  { id: '2ar', name: '2AR', duration: 300, side: 'AFF' },
]

export const LD_PREP_TIME = 240 // 4 minutes per side
export const PF_PREP_TIME = 180 // 3 minutes per team
export const CX_PREP_TIME = 480 // 8 minutes per team

export function getSpeechesForFormat(format: Format): SpeechDef[] {
  switch (format) {
    case 'LD': return LD_SPEECHES
    case 'PF': return PF_SPEECHES
    case 'CX': return CX_SPEECHES
  }
}

export function getPrepTimeForFormat(format: Format): number {
  switch (format) {
    case 'LD': return LD_PREP_TIME
    case 'PF': return PF_PREP_TIME
    case 'CX': return CX_PREP_TIME
  }
}

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
