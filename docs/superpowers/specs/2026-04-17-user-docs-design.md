# User Docs & GitHub Ship Design

**Date:** 2026-04-17
**Project:** mcjiggler

## Goal

Add a polished README with real screenshots to mcjiggler and push the full app as a new public repo at `jshen-avtx/mcjiggler`.

## Approach

Single Haiku agent executes all steps sequentially.

## Steps

1. **Remove `"private": true`** from `package.json` to allow GitHub install
2. **Run the app** — `npm start` in background, wait for tray icon to appear
3. **Take screenshots** — tray icon in menu bar, popup preferences window — saved to `assets/screenshots/`
4. **Write README.md** with sections below
5. **Create GitHub repo** — `gh repo create jshen-avtx/mcjiggler --public --source=. --remote=origin --push`

## README Sections

- Badge line (macOS, Electron, version 0.1.0)
- One-liner description
- Install from GitHub: `npm install github:jshen-avtx/mcjiggler`
- Clone & run: `git clone ... && npm install && npm start`
- Build DMG: `npm run dist`
- Screenshots (tray icon + popup)
- How it works: moves mouse on configurable interval, auto-pauses on real user input, persists settings

## Out of Scope

- GitHub Pages
- CI/CD or release automation
- Contribution guide
