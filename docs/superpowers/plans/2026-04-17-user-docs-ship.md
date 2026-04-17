# User Docs & GitHub Ship Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a README with real screenshots to mcjiggler and push the full app as a new public repo at `jshen-avtx/mcjiggler`.

**Architecture:** Single Haiku agent runs the Electron app, captures screenshots via macOS `screencapture`, writes `README.md`, then creates and pushes to a new GitHub repo. No new source files — only `README.md`, `assets/screenshots/`, and a small `package.json` change.

**Tech Stack:** Electron (existing), macOS `screencapture` + `osascript` for screenshots, `gh` CLI for GitHub repo creation.

---

## File Map

| File | Action |
|------|--------|
| `package.json` | Modify — remove `"private": true` |
| `assets/screenshots/tray.png` | Create — screenshot of menu bar with tray icon visible |
| `assets/screenshots/popup.png` | Create — screenshot of preferences popup |
| `README.md` | Create — user-facing docs with badges, install, usage, screenshots |

---

## Task 1: Remove `"private": true` from package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove the private field**

Edit `package.json` — remove line `"private": true,` so the package can be installed via GitHub URL. The result should look like:

```json
{
  "name": "mcjiggler",
  "version": "0.1.0",
  "description": "macOS menu-bar mouse jiggler",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "test": "jest",
    "test:watch": "jest --watch",
    "dist": "electron-builder --mac"
  },
  ...
}
```

- [ ] **Step 2: Verify JSON is valid**

```bash
node -e "require('./package.json')" && echo "OK"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: remove private flag to allow GitHub install"
```

---

## Task 2: Create screenshots directory and launch the app

**Files:**
- Create: `assets/screenshots/` (directory)

- [ ] **Step 1: Create directory**

```bash
mkdir -p assets/screenshots
```

- [ ] **Step 2: Grant accessibility permissions if needed**

nut-js requires Accessibility access. If the app has never run, macOS will prompt. Check:

```bash
# Just run the app once — if it crashes with accessibility error, open:
# System Settings → Privacy & Security → Accessibility → enable Terminal (or the app)
npm start &
APP_PID=$!
sleep 4
```

- [ ] **Step 3: Verify app is running**

```bash
pgrep -fl "electron" | head -5
```

Expected: lines containing `electron` and `mcjiggler`

---

## Task 3: Take screenshot of the tray icon in the menu bar

**Files:**
- Create: `assets/screenshots/tray.png`

- [ ] **Step 1: Capture the full menu bar area**

The tray icon lives in the top-right of the menu bar. Capture the right portion of the top of the screen (adjust coordinates if display resolution differs — standard 2560×1600 shown):

```bash
# Capture top-right 400×30 px of screen (covers system tray area)
screencapture -x -R 2160,0,400,30 assets/screenshots/tray.png
```

- [ ] **Step 2: Verify the file exists and is non-empty**

```bash
ls -lh assets/screenshots/tray.png
```

Expected: file size > 1KB

- [ ] **Step 3: If coordinates are wrong, capture full top bar instead**

```bash
# Fallback: capture entire menu bar height across full width
screencapture -x -R 0,0,2560,30 assets/screenshots/tray.png
```

---

## Task 4: Open the preferences popup and screenshot it

**Files:**
- Create: `assets/screenshots/popup.png`

- [ ] **Step 1: Click the tray icon via AppleScript to open popup**

```bash
osascript <<'EOF'
tell application "System Events"
  -- Click the Mouse Jiggler menu bar item
  set mb to menu bar 1 of (first process whose name contains "Electron")
  click menu bar item 1 of mb
end tell
EOF
```

If that fails (wrong process name), try:

```bash
osascript <<'EOF'
tell application "System Events"
  set p to first process whose bundle identifier contains "jamesshen.mcjiggler"
  click menu bar item 1 of menu bar 1 of p
end tell
EOF
```

- [ ] **Step 2: Wait for popup to appear**

```bash
sleep 1
```

- [ ] **Step 3: Screenshot the popup window region**

The popup is 280×260 px, positioned near the tray icon (top-right area). Capture a generous region:

```bash
screencapture -x -R 2100,25,380,300 assets/screenshots/popup.png
```

- [ ] **Step 4: Verify screenshot is non-empty**

```bash
ls -lh assets/screenshots/popup.png
```

Expected: file size > 5KB (popup has content)

- [ ] **Step 5: Quit the app**

```bash
pkill -f "electron.*mcjiggler" 2>/dev/null || pkill -f "Electron" 2>/dev/null; true
```

---

## Task 5: Write README.md

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write the full README**

Create `README.md` with this exact content (update badge version if needed):

```markdown
# Mouse Jiggler

![macOS](https://img.shields.io/badge/macOS-12%2B-blue?logo=apple)
![Electron](https://img.shields.io/badge/Electron-31-blue?logo=electron)
![Version](https://img.shields.io/badge/version-0.1.0-green)

A lightweight macOS menu-bar app that moves your mouse cursor at a configurable interval — keeping your machine awake and your status green.

## Screenshots

<img src="assets/screenshots/tray.png" alt="Tray icon in menu bar" width="300" />

<img src="assets/screenshots/popup.png" alt="Preferences popup" width="280" />

## Install

**From GitHub (no clone needed):**

```bash
npm install github:jshen-avtx/mcjiggler
```

**Or clone and run:**

```bash
git clone https://github.com/jshen-avtx/mcjiggler
cd mcjiggler
npm install
npm start
```

## Build a distributable DMG

```bash
npm run dist
```

The `.dmg` will appear in `dist/`.

## How it works

- Sits in the macOS menu bar as a small ring icon
- Click the icon to open preferences
- Set the **interval** (seconds between mouse moves)
- Enable **Pause on user input** — the jiggler auto-stops when it detects real mouse movement and resumes when you're idle again
- Settings persist across launches via `electron-store`

## Requirements

- macOS 12 Monterey or later
- Node.js 18+
- Accessibility permission for the app (macOS will prompt on first run)
```

- [ ] **Step 2: Verify file was written**

```bash
wc -l README.md
```

Expected: ~60 lines

- [ ] **Step 3: Commit**

```bash
git add README.md assets/screenshots/
git commit -m "docs: add README with screenshots"
```

---

## Task 6: Create GitHub repo and push

**Files:** none (git remote operation)

- [ ] **Step 1: Verify gh CLI is authenticated**

```bash
gh auth status
```

Expected: `Logged in to github.com as jshen-avtx` (or similar). If not logged in, run `gh auth login`.

- [ ] **Step 2: Create the public repo and push**

```bash
gh repo create jshen-avtx/mcjiggler \
  --public \
  --description "macOS menu-bar mouse jiggler" \
  --source=. \
  --remote=origin \
  --push
```

Expected output: URL like `https://github.com/jshen-avtx/mcjiggler`

- [ ] **Step 3: Verify the push**

```bash
gh repo view jshen-avtx/mcjiggler --web
```

This opens the repo in the browser. Confirm README renders with screenshots.

- [ ] **Step 4: Print the repo URL**

```bash
echo "Repo live at: https://github.com/jshen-avtx/mcjiggler"
```
