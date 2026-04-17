'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('jigglerApi', {
  getState: () => ipcRenderer.invoke('jiggler:getState'),
  setEnabled: (enabled) => ipcRenderer.invoke('jiggler:setEnabled', enabled),
  setInterval: (seconds) =>
    ipcRenderer.invoke('jiggler:setInterval', seconds),
  setPauseOnUserInput: (value) =>
    ipcRenderer.invoke('jiggler:setPauseOnUserInput', value),
  quit: () => ipcRenderer.invoke('jiggler:quit'),
  onStateChanged: (handler) => {
    const listener = (_event, state) => handler(state);
    ipcRenderer.on('jiggler:state', listener);
    return () => ipcRenderer.removeListener('jiggler:state', listener);
  },
});
