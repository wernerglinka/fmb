const path = require('path');
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  writeObjectToFile: (obj) => ipcRenderer.invoke('writeObjectToFile', obj), // use to get the page object from the renderer process to the main process
  openDialog: (method, config) => ipcRenderer.invoke('dialog', method, config), // use to open a dialog from the renderer process to the main process
  getSchemas: (path) => ipcRenderer.invoke('getSchemas', path),
  receiveComponentType: (callback) => ipcRenderer.on('componentType', callback)
})

