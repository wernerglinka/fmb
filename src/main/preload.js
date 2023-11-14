const path = require('path');
const { contextBridge, ipcRenderer } = require('electron');

const convertToYAML = require('js-yaml');

// Expose protected methods that allow the renderer process to use
contextBridge.exposeInMainWorld('electronAPI', {
  writeObjectToFile: (obj) => ipcRenderer.invoke('writeObjectToFile', obj), // use to get the page object from the renderer process to the main process
  openDialog: (method, config) => ipcRenderer.invoke('dialog', method, config), // use to open a dialog from the renderer process to the main process
  getSchemas: (path) => ipcRenderer.invoke('getSchemas', path),
  receiveComponentType: (callback) => ipcRenderer.on('componentType', callback),
  sendToOtherRenderer: (targetIdentifier, objectToSend) => ipcRenderer.send('send-to-other-renderer', { targetIdentifier, objectToSend }),
  receiveFromOtherRenderer: (callback) => ipcRenderer.on('receive-from-other-renderer', callback),
  sendMessageToMain: (message) => ipcRenderer.send('message-to-main', message),
  receiveMessage: (channel, func) => { 
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  toYAML: (args) => convertToYAML.dump(args)
})

