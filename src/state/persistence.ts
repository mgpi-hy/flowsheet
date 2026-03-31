import type { AppState, Round } from '../types'

const STORAGE_KEY = 'flowsheet_state'

export function loadState(): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage full or unavailable
  }
}

export function exportRound(round: Round): void {
  const blob = new Blob([JSON.stringify(round, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `flowsheet-${round.affTeam}-v-${round.negTeam}-${round.date.slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importRound(file: File): Promise<Round> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const round = JSON.parse(reader.result as string) as Round
        if (!round.id || !round.format || !round.nodes) {
          reject(new Error('Invalid round file'))
          return
        }
        resolve(round)
      } catch {
        reject(new Error('Failed to parse round file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
