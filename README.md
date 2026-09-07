# FlowSheet

A judge's debate flowing tool. Built for LD because that's what I judge.

Four columns: constructive, attacks, rebuttals, flows through (weighing). Aff on top, neg on bottom. You click to generate argument nodes (ctrl+click for aff, ctrl+right-click for neg), use flow operators to track what lives and what dies. Backslash terminates an argument. Forward slash flows it through to the next column.

Per-speech timers with manual advance. Oral critique notes sorted by speech so you can reconstruct what you said and when. RFD workspace that pre-loads from surviving arguments, so you're not starting from scratch when the round ends and you need to explain yourself.

Pure client-side. localStorage. No backend, no accounts, no cloud. Your flows stay on your machine. JSON export/import for round persistence. Works offline at tournaments because tournament wifi is a contradiction in terms.

## Stack

Vue + TypeScript + Vite.

## Run

```bash
npm install
npm run dev
```

Or use the hosted version at [synestheizure.net/flowsheet](https://synestheizure.net/flowsheet).

## Status

Built for LD. PF and Policy formats coming.

## Website terminal UI

The application uses Synestheizure's shared light/dark terminal shell. Its canonical source is `r-suite/shared/`; run `node ../r-suite/shared/sync.mjs .` from this checkout to refresh the generated shell, themes, and `src/project.css`. Shared JetBrains Mono fonts are served by the website at `/fonts/`; standalone development uses the system monospace fallback. The website's project browser suite covers round creation, flowing, timers, notes, exports, reloads, and mobile layouts.
