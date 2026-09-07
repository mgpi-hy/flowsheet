const THEMES = {
  'belladonna-light': { bg: '#fffefd', bgSecondary: '#f7f3f6', text: '#493544', dim: '#796675', bright: '#382636', border: '#d7c9df', cyan: '#765194', ice: '#326f67', rust: '#93611e', blood: '#ba3f42', amber: '#9f3f61', selection: '#974768' },
  belladonna: { bg: '#170d22', bgSecondary: '#24152f', text: '#f4e7dc', dim: '#bcaac4', bright: '#fff6ec', border: '#604c72', cyan: '#57e5c4', ice: '#c79cff', rust: '#ffd06a', blood: '#ff7659', amber: '#ff8bb9', selection: '#92366d' },
  default: {
    bg: '#0d0d0d',
    bgSecondary: '#111414',
    text: '#e5e7eb',
    dim: '#6b7280',
    bright: '#f3f4f6',
    border: '#004d40',
    cyan: '#00ffff',
    ice: '#a5f3fc',
    rust: '#b7410e',
    blood: '#ff2a00',
    amber: '#ffb432',
    selection: '#b7410e',
  },
  gruvbox: {
    bg: '#282828',
    bgSecondary: '#3c3836',
    text: '#ebdbb2',
    dim: '#928374',
    bright: '#fbf1c7',
    border: '#3c3836',
    cyan: '#83a598',
    ice: '#8ec07c',
    rust: '#cc241d',
    blood: '#fb4934',
    amber: '#fabd2f',
    selection: '#458588',
  },
  dracula: {
    bg: '#282a36',
    bgSecondary: '#44475a',
    text: '#f8f8f2',
    dim: '#6272a4',
    bright: '#f8f8f2',
    border: '#44475a',
    cyan: '#8be9fd',
    ice: '#bd93f9',
    rust: '#ff5555',
    blood: '#ff6e6e',
    amber: '#f1fa8c',
    selection: '#ff79c6',
  },
  bloodmoon: {
    bg: '#0a0a0a',
    bgSecondary: '#1a0000',
    text: '#d4d4d4',
    dim: '#666666',
    bright: '#e0e0e0',
    border: '#1a0000',
    cyan: '#ff6b6b',
    ice: '#ff8888',
    rust: '#8b0000',
    blood: '#dc143c',
    amber: '#ff4444',
    selection: '#8b0000',
  },
  seraph: {
    bg: '#fefefe',
    bgSecondary: '#e8e8e8',
    text: '#2d2d2d',
    dim: '#666666',
    bright: '#1a1a1a',
    border: '#e8e8e8',
    cyan: '#4a90d9',
    ice: '#87ceeb',
    rust: '#7c5295',
    blood: '#9966cc',
    amber: '#daa520',
    selection: '#b8860b',
  },
} as const

export type ThemeName = keyof typeof THEMES
export const themeNames = Object.keys(THEMES) as ThemeName[]
export function resolveTheme(value: string): ThemeName | undefined {
  const name = value === 'light' ? 'belladonna-light' : value === 'dark' ? 'belladonna' : value
  return Object.hasOwn(THEMES, name) ? name as ThemeName : undefined
}
export function savedTheme(): ThemeName {
  try {
    const site = JSON.parse(localStorage.getItem('synestheizure-state') || '{}').theme
    if (site) return resolveTheme(site === 'default' ? 'light' : site) || 'belladonna-light'
    return resolveTheme(localStorage.getItem('r-suite-theme') || 'light') || 'belladonna-light'
  } catch { return 'belladonna-light' }
}
export function applyTheme(name: ThemeName) {
  const t = THEMES[name]
  const root = document.documentElement
  const values: Record<string, string> = {
    bg: t.bg, 'bg-secondary': t.bgSecondary, 'bg-tertiary': t.bgSecondary,
    fg: t.text, 'fg-dim': t.dim, 'fg-bright': t.bright, border: t.border,
    pine: t.cyan, 'pine-dim': t.border, 'pine-bright': t.ice, cyan: t.cyan,
    rust: t.rust, 'rust-bright': t.blood, blood: t.blood, sand: t.amber,
    'sand-bright': t.amber, amber: t.amber, selection: t.selection,
    sage: t.ice, 'sage-bright': t.ice, slate: t.dim, 'slate-bright': t.text,
    aff: t.cyan, 'aff-dim': t.border, 'aff-text': t.cyan,
    neg: t.blood, 'neg-dim': t.border, 'neg-text': t.blood,
    prefix: t.cyan, root: t.amber, suffix: t.ice, infix: t.dim,
    high: t.ice, medium: t.amber, low: t.blood,
    parchment: t.bg, 'parchment-dark': t.bgSecondary,
    ink: t.text, 'ink-light': t.dim, 'ink-faint': t.border,
  }
  for (const [key, value] of Object.entries(values)) root.style.setProperty(`--color-${key}`, value)
  for (const side of ['aff', 'neg']) {
    root.style.setProperty(`--color-${side}-bg`, `color-mix(in srgb, var(--color-${side}) 8%, var(--color-bg))`)
    root.style.setProperty(`--color-${side}-border`, `color-mix(in srgb, var(--color-${side}) 35%, var(--color-bg))`)
  }
  for (const part of ['prefix', 'root', 'suffix', 'infix']) root.style.setProperty(`--color-${part}-light`, `color-mix(in srgb, var(--color-${part}) 12%, var(--color-bg))`)
  root.dataset.projectTheme = name
  root.style.colorScheme = name === 'belladonna-light' || name === 'seraph' ? 'light' : 'dark'
}
// Apply before React mounts, including saved preferences, to avoid a dark flash.
applyTheme(savedTheme())
