const os = require('os');
const path = require('path');
const { contextBridge, ipcRenderer } = require('electron');
const Toastify = require('toastify-js');

contextBridge.exposeInMainWorld('os', {
  homedir: () => os.homedir(),
});

contextBridge.exposeInMainWorld('path', {
  join: (...args) => path.join(...args),
});

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

//contextBridge.exposeInMainWorld('electronAPI', {
//  getSchema: (schema) => ipcRenderer.invoke('schema:get', schema),
//})

contextBridge.exposeInMainWorld('Toastify', {
  toast: (options) => Toastify(options).showToast(),
});


contextBridge.exposeInMainWorld('electronAPI', {
  writeObjectToFile: (obj) => ipcRenderer.invoke('writeObjectToFile', obj), // use to get the page object from the renderer process to the main process
  openDialog: (method, config) => ipcRenderer.invoke('dialog', method, config), // use to open a dialog from the renderer process to the main process
  getSchemas: (path) => ipcRenderer.invoke('getSchemas', path),
})

