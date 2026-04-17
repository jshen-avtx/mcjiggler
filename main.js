'use strict';

const path = require('node:path');
const {
  app,
  Tray,
  Menu,
  BrowserWindow,
  ipcMain,
  nativeImage,
  screen,
} = require('electron');
const Store = require('electron-store');
const nut = require('@nut-tree-fork/nut-js');

const { createJiggler } = require('./lib/jiggler');
const { createMouseAdapter } = require('./lib/mouse-adapter');
const { normalizeSettings, DEFAULT_SETTINGS } = require('./lib/settings');

if (process.platform === 'darwin' && app.dock) {
  app.dock.hide();
}

const store = new Store({
  name: 'mcjiggler-settings',
  defaults: DEFAULT_SETTINGS,
});

const mouseAdapter = createMouseAdapter(nut);

const syncMouse = {
  getPosition: () => mouseAdapter.getPosition(),
  moveBy: (dx, dy) => {
    const current = mouseAdapter.getPosition();
    const optimistic = { x: current.x + dx, y: current.y + dy };
    mouseAdapter.moveByAsync(dx, dy).catch((err) => {
      console.error('[mcjiggler] moveByAsync failed:', err);
    });
    return optimistic;
  },
};

const nodeClock = {
  setTimeout: (fn, ms) => setTimeout(async () => {
    await mouseAdapter.poll();
    fn();
  }, ms),
  clearTimeout: (id) => clearTimeout(id),
};

let tray = null;
let popup = null;
let jiggler = null;

function currentSettings() {
  return normalizeSettings(store.store);
}

function broadcastState() {
  const payload = {
    running: jiggler ? jiggler.isRunning() : false,
    settings: currentSettings(),
  };
  if (popup && !popup.isDestroyed()) {
    popup.webContents.send('jiggler:state', payload);
  }
  updateTrayMenu();
}

function updateTrayMenu() {
  if (!tray) return;
  const running = jiggler ? jiggler.isRunning() : false;
  const settings = currentSettings();
  const template = [
    {
      label: running ? 'Jiggling (click to stop)' : 'Idle (click to start)',
      click: () => toggleEnabled(),
    },
    { type: 'separator' },
    {
      label: `Interval: ${settings.intervalSeconds}s`,
      enabled: false,
    },
    {
      label: `Pause on user input: ${
        settings.pauseOnUserInput ? 'on' : 'off'
      }`,
      enabled: false,
    },
    { type: 'separator' },
    { label: 'Preferences...', click: () => togglePopup() },
    { label: 'Quit', role: 'quit' },
  ];
  tray.setContextMenu(Menu.buildFromTemplate(template));
  tray.setToolTip(running ? 'Mouse Jiggler: on' : 'Mouse Jiggler: off');
}

async function toggleEnabled() {
  if (!jiggler) return;
  if (jiggler.isRunning()) {
    jiggler.stop();
    store.set('enabled', false);
  } else {
    await mouseAdapter.poll();
    jiggler.updateSettings(currentSettings());
    jiggler.start();
    store.set('enabled', true);
  }
  broadcastState();
}

function createPopup() {
  popup = new BrowserWindow({
    width: 280,
    height: 260,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  popup.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  popup.on('blur', () => {
    if (popup && popup.isVisible()) popup.hide();
  });
}

function positionPopupNearTray() {
  if (!popup || !tray) return;
  const trayBounds = tray.getBounds();
  const winBounds = popup.getBounds();
  const display = screen.getDisplayNearestPoint({
    x: trayBounds.x,
    y: trayBounds.y,
  });
  const x = Math.round(
    Math.min(
      display.workArea.x + display.workArea.width - winBounds.width - 8,
      Math.max(display.workArea.x + 8, trayBounds.x - winBounds.width / 2),
    ),
  );
  const y = Math.round(trayBounds.y + trayBounds.height + 4);
  popup.setPosition(x, y, false);
}

function togglePopup() {
  if (!popup) createPopup();
  if (popup.isVisible()) {
    popup.hide();
    return;
  }
  positionPopupNearTray();
  popup.show();
  popup.focus();
  broadcastState();
}

function registerIpc() {
  ipcMain.handle('jiggler:getState', () => ({
    running: jiggler ? jiggler.isRunning() : false,
    settings: currentSettings(),
  }));

  ipcMain.handle('jiggler:setEnabled', async (_event, enabled) => {
    if (!jiggler) return;
    if (enabled && !jiggler.isRunning()) {
      await mouseAdapter.poll();
      jiggler.updateSettings(currentSettings());
      jiggler.start();
      store.set('enabled', true);
    } else if (!enabled && jiggler.isRunning()) {
      jiggler.stop();
      store.set('enabled', false);
    }
    broadcastState();
  });

  ipcMain.handle('jiggler:setInterval', (_event, seconds) => {
    const next = normalizeSettings({ ...currentSettings(), intervalSeconds: seconds });
    store.set('intervalSeconds', next.intervalSeconds);
    if (jiggler) jiggler.updateSettings(next);
    broadcastState();
  });

  ipcMain.handle('jiggler:setPauseOnUserInput', (_event, value) => {
    const next = normalizeSettings({
      ...currentSettings(),
      pauseOnUserInput: Boolean(value),
    });
    store.set('pauseOnUserInput', next.pauseOnUserInput);
    if (jiggler) jiggler.updateSettings(next);
    broadcastState();
  });

  ipcMain.handle('jiggler:quit', () => app.quit());
}

async function handleReady() {
  const iconPath = path.join(__dirname, 'assets', 'iconTemplate.png');
  const image = nativeImage.createFromPath(iconPath);
  image.setTemplateImage(true);
  tray = new Tray(image);
  tray.on('click', () => togglePopup());

  await mouseAdapter.poll();

  jiggler = createJiggler({
    clock: nodeClock,
    mouse: syncMouse,
    settings: currentSettings(),
    onUserInput: () => {
      store.set('enabled', false);
      broadcastState();
    },
  });

  registerIpc();
  createPopup();

  if (currentSettings().enabled) {
    jiggler.start();
  }
  broadcastState();
}

app.whenReady().then(handleReady).catch((err) => {
  console.error('[mcjiggler] startup failed:', err);
  app.quit();
});

// Keep the app alive when all windows are closed — tray icon stays active.
// On macOS the default is already to stay alive, but being explicit here
// prevents accidental quit if the behavior ever changes.
app.on('window-all-closed', () => {
  // do nothing — the tray icon keeps the app running
});
