import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { applyTheme, resolveTheme, savedTheme, themeNames, type ThemeName } from './themes'

interface ShortcutCategory { category: string; items: { keys: string[]; description: string }[] }
interface TuiShellProps {
  appName: string
  panes: { name: string; ref: RefObject<HTMLElement | null> }[]
  shortcuts: ShortcutCategory[]
  siteUrl?: string
}
const APPS = ['radish', 'recount', 'reflex', 'resound', 'riposte', 'flowsheet']
const DESCRIPTIONS = ['word origins / root forge', 'personal data explorer', 'event log / patterns', 'prosody / scansion', 'argument editor / analysis', 'debate flow / round timer']
const interactive = 'input, textarea, select, button, a, [contenteditable="true"], [role="textbox"], [role="dialog"], dialog'

export function TuiHeader({ appName, children }: { appName: string; children?: ReactNode }) {
  return <header className="tui-header"><a className="tui-home" href="/">~/SYNESTHEIZURE</a><span className="tui-app-path">/ {appName}</span><div className="tui-header-tools">{children}</div></header>
}

export function TuiShell({ appName, panes, shortcuts, siteUrl = '/' }: TuiShellProps) {
  const [theme, setTheme] = useState<ThemeName>(savedTheme)
  const [dialog, setDialog] = useState<'theme' | 'help' | 'apps' | null>(null)
  const [input, setInput] = useState('')
  const [lines, setLines] = useState<string[]>([])
  const [expanded, setExpanded] = useState(false)
  const [paneName, setPaneName] = useState('ready')
  const inputRef = useRef<HTMLInputElement>(null)
  const footerRef = useRef<HTMLElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const history = useRef<string[]>([])
  const historyIndex = useRef(-1)
  const draft = useRef('')
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => { applyTheme(theme) }, [theme])
  useLayoutEffect(() => {
    document.documentElement.dataset.project = appName
    const footer = footerRef.current
    if (!footer) return
    const resize = new ResizeObserver(() => document.documentElement.style.setProperty('--tui-footer-height', `${footer.offsetHeight}px`))
    document.documentElement.style.setProperty('--tui-footer-height', `${footer.offsetHeight}px`)
    resize.observe(footer)
    return () => resize.disconnect()
  }, [appName])
  useEffect(() => {
    const modal = dialogRef.current
    if (!modal) return
    if (dialog && !modal.open) { returnFocus.current = document.activeElement as HTMLElement; modal.showModal() }
    if (!dialog && modal.open) { modal.close(); returnFocus.current?.focus({ preventScroll: true }) }
  }, [dialog])
  useEffect(() => { if (expanded) outputRef.current?.scrollTo(0, outputRef.current.scrollHeight) }, [lines, expanded])
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey || document.querySelector('dialog[open]')) return
      if (event.key === 'F6') {
        const available = panes.filter(pane => pane.ref.current?.getClientRects().length)
        if (!available.length) return
        event.preventDefault()
        const current = available.findIndex(pane => pane.ref.current?.contains(document.activeElement))
        const next = available[(current + (event.shiftKey ? -1 : 1) + available.length) % available.length]
        next.ref.current?.focus({ preventScroll: true }); setPaneName(next.name)
        return
      }
      if ((event.target as HTMLElement).closest(interactive)) return
      if (event.key === ':') { event.preventDefault(); inputRef.current?.focus() }
      if (event.key === '?') { event.preventDefault(); setDialog('help') }
      if (event.key === 't') { event.preventDefault(); setDialog('theme') }
      if (event.key === 'j' || event.key === 'k') {
        const pane = panes.find(item => item.ref.current?.contains(document.activeElement))?.ref.current
        if (pane) { event.preventDefault(); pane.scrollBy({ top: event.key === 'j' ? 64 : -64, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }) }
      }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [panes])

  function changeTheme(next: ThemeName) {
    setTheme(next)
    try {
      localStorage.setItem('r-suite-theme', next)
      const raw = localStorage.getItem('synestheizure-state')
      const state = raw ? JSON.parse(raw) : {}
      // The original suite's black/cyan theme has no corresponding site theme.
      if (next !== 'default') localStorage.setItem('synestheizure-state', JSON.stringify({ ...state, theme: next }))
    } catch { /* Themes also work when storage is unavailable. */ }
  }
  function run() {
    const command = input.trim()
    if (!command) return
    history.current = [...history.current.slice(-49), command]; historyIndex.current = -1
    setInput('')
    const [verb, arg] = command.toLowerCase().split(/\s+/)
    let result = ''
    if (verb === 'clear') { setLines([]); return }
    if (verb === 'help') result = 'help · ls · cd <project> · theme <light|dark|name> · pwd · whoami · clear'
    else if (verb === 'ls') result = APPS.map(app => `${app}/`).join('  ')
    else if (verb === 'pwd') result = `~/projects/${appName}`
    else if (verb === 'whoami') result = 'guest@synestheizure'
    else if (verb === 'theme') {
      const next = arg && resolveTheme(arg)
      if (!arg) setDialog('theme')
      else if (next) { changeTheme(next); result = `theme: ${next}` }
      else result = `Unknown theme. Choose: light, dark, ${themeNames.join(', ')}`
    } else if (verb === 'cd' || verb === 'open') {
      const target = (arg || '').replace(/^\//, '').replace(/\/$/, '')
      if (APPS.includes(target)) window.location.assign(`/${target}/index.html`)
      else if (['', '~', '..', 'main', 'home'].includes(target)) window.location.assign(siteUrl)
      else result = `Unknown project: ${arg}. Type ls to list projects.`
    } else result = `Command not found: ${verb}. Type help.`
    setLines(previous => [...previous, `$ ${command}`, ...(result ? [result] : [])].slice(-80))
  }

  return <>
    <footer className="tui-footer" ref={footerRef} onFocus={() => setExpanded(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setExpanded(false) }}>
      {expanded && lines.length > 0 && <div ref={outputRef} className="tui-transcript" role="log" aria-label="Command output">{lines.map((line, index) => <div key={index}>{line}</div>)}</div>}
      <form className="tui-prompt" onSubmit={event => { event.preventDefault(); run() }}>
        <label htmlFor="project-command">$</label>
        <input id="project-command" ref={inputRef} aria-label="Terminal command" autoComplete="off" autoCapitalize="off" spellCheck={false} value={input} placeholder="help · theme · cd" onChange={event => setInput(event.target.value)} onKeyDown={event => {
          if (event.key === 'Escape') { event.preventDefault(); inputRef.current?.blur(); setExpanded(false) }
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault()
            if (historyIndex.current === -1) draft.current = input
            const next = event.key === 'ArrowUp' ? Math.min(history.current.length - 1, historyIndex.current + 1) : Math.max(-1, historyIndex.current - 1)
            historyIndex.current = next
            setInput(next === -1 ? draft.current : history.current[history.current.length - 1 - next] || '')
          }
        }} />
      </form>
      <div className="tui-status"><span className="tui-status-path">~/projects/{appName}</span><span className="tui-status-pane">[{paneName}]</span><span className="tui-weave" aria-hidden="true">{theme === 'bromber' ? '─<+>─' : '─<◇>─'}</span><div className="tui-status-actions"><button type="button" onClick={() => setDialog('apps')}>projects</button><button type="button" onClick={() => setDialog('theme')}>{theme === 'belladonna-light' ? 'light' : theme === 'belladonna' ? 'dark' : theme === 'bromber' ? 'Brómber' : theme}</button><button type="button" onClick={() => setDialog('help')}>? keys</button></div></div>
    </footer>
    <dialog className="tui-dialog" ref={dialogRef} aria-labelledby="tui-dialog-title" onCancel={event => { event.preventDefault(); setDialog(null) }}>
      <div className="tui-dialog-heading"><h2 id="tui-dialog-title">{dialog === 'theme' ? '/etc/themes' : dialog === 'apps' ? '~/projects' : 'help.txt'}</h2><button type="button" aria-label="Close dialog" onClick={() => setDialog(null)}>[esc / close]</button></div>
      <div className="tui-dialog-body">
        {dialog === 'theme' && themeNames.map(name => <button type="button" className="tui-choice" key={name} aria-pressed={theme === name} onClick={() => { changeTheme(name); setDialog(null) }}><span>{theme === name ? '[x]' : '[ ]'} {name === 'belladonna-light' ? 'Belladonna / light' : name === 'belladonna' ? 'Belladonna / dark' : name === 'bromber' ? 'Brómber / timber & woad' : name}</span></button>)}
        {dialog === 'apps' && APPS.map((app, index) => <a className="tui-choice" href={`/${app}/index.html`} key={app}><span>{app === appName ? '>' : ' '} {app}/</span><small>{DESCRIPTIONS[index]}</small></a>)}
        {dialog === 'help' && [...shortcuts, { category: 'Terminal', items: [{ keys: ['F6', 'Shift+F6'], description: 'Next / previous pane' }, { keys: ['Tab'], description: 'Next control' }, { keys: [':'], description: 'Command line' }, { keys: ['t', '?'], description: 'Themes / help (outside controls)' }, { keys: ['Esc'], description: 'Close dialog or fold command line' }] }].map((category, index) => <section key={index}><h3>{category.category}</h3><dl>{category.items.map((item, i) => <div key={i}><dt>{item.keys.join(' / ')}</dt><dd>{item.description}</dd></div>)}</dl></section>)}
      </div>
    </dialog>
  </>
}
