# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Cinematic is an Electron + React desktop app for managing movie collections. It scans local directories for video files, parses filenames to extract titles, fetches metadata from OMDB/TMDB APIs, and presents a browsable library with genres, playlists, and ratings. Runs on macOS, Windows, and Linux.

## Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start dev mode (launches renderer dev server, then main process via electronmon) |
| `npm run build` | Build both main and renderer for production |
| `npm run build:main` | Build main process only |
| `npm run build:renderer` | Build renderer process only |
| `npm test` | Run Jest tests |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run package:mac` | Package macOS distributable |
| `npm run package:windows` | Package Windows distributable |
| `npm run package:linux` | Package Linux distributable |
| `npm run analyze` | Bundle analyzer (sets ANALYZE=true) |

After `npm install`, the postinstall script automatically builds the DLL bundle needed for dev mode.

## Architecture

### Process Model (Electron)

```
Main Process (src/main/)          Renderer Process (src/renderer/)
├── main.ts         entry point   ├── index.tsx        React entry
├── startup.ts      app lifecycle ├── components/      70+ React components
├── ipc.ts          IPC handlers  ├── context/         React context providers
├── store.ts        electron-store│   ├── global-context.tsx   (settings, keybinds, app info)
├── store-actions.ts              │   ├── library-context.tsx  (library, genres, playlists)
├── file.ts         dir scanning  │   └── theme-context.tsx    (dark/light)
├── media.ts        metadata      ├── config/          nav routes, renderer constants
├── q.ts            fetch queue   └── styles/          SCSS
├── preload.ts      contextBridge
└── keyboard.ts     shortcuts
```

### Shared Code (src/)

- `config/` — Constants, IPC channel names (`ipc-channels.ts`), settings schema, localization strings
- `types/` — TypeScript types for media files, metadata, keyboard, notifications
- `lib/` — `fetch-meta.ts` (OMDB/TMDB/trailer API calls), `reconcile-meta.ts` (metadata merging)
- `utils/` — Small shared utilities (debounce, throttle, UUID, OS detection)

### IPC Communication

All IPC channels are defined in `src/config/ipc-channels.ts`. The preload script (`src/main/preload.ts`) exposes a whitelisted `window.electron` API via `contextBridge`.

**Key patterns:**
- Pull: Renderer calls `ipcRenderer.invoke()` → Main handles and returns data (GET_LIBRARY, GET_SETTINGS, etc.)
- Push: Main broadcasts changes → Renderer listens via `ipcRenderer.on()` (LIBRARY_UPDATED, SETTINGS_UPDATED)

### Data Flow: File Scanning → Library

1. User adds folder via dialog → `OPEN_MEDIA_PATH` IPC
2. `file.ts` recursively scans for video files (depth controlled by `FILE_SCAN_DEPTH` in config)
3. Filenames parsed via `parse-torrent-filename` or regex to extract title/year
4. Media queued in `q.ts` (fastq) for async metadata fetch from OMDB/TMDB
5. Results cached in electron-store with timeout
6. Library broadcast to renderer via `LIBRARY_UPDATED`

### State Management

- **Main process:** `electron-store` (persistent JSON) — library, genres, playlists, cache, settings, keybinds
- **Renderer:** React Context (GlobalContext, LibraryContext, ThemeContext) + React Router (hash-based)

### Routing

Hash-based routing via `react-router-dom` (`createHashRouter`). Routes defined in `src/renderer/config/nav.tsx`. Key routes: `/`, `/browse`, `/liked`, `/genres/:id`, `/playlists/:id`, `/media/:id`, `/settings/*`.

## Build System

Webpack 5 with separate configs for main, renderer, and preload in `.erb/configs/`. Based on Electron React Boilerplate. The DLL bundle (`.erb/dll/`) caches vendor modules for faster renderer dev builds.

Packaging uses `electron-builder` configured in `package.json` under `"build"`. Output goes to `release/build/`.

## Code Style

- Path alias: `@/*` maps to `src/*`
- UI components: shadcn/ui in `src/renderer/components/ui/` (ESLint-ignored)
- Prettier: single quotes
- ESLint extends `erb` config; `@typescript-eslint/no-shadow` enforced
- Valid video filetypes defined in `src/config/config.ts` (`VALID_FILETYPES`)

## Key Config Files

- `src/config/config.ts` — API keys (OMDB/TMDB defaults), app dimensions, file scan depth, valid filetypes, throttle/debounce delays
- `src/config/settings.ts` — Settings types and defaults
- `src/config/keys.ts` — Settings and keybind key constants
- `src/main/store.ts` — electron-store schema definition
- `components.json` — shadcn/ui configuration
