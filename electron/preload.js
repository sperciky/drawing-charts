const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  saveFile: (options) => ipcRenderer.invoke('save-file', options),
  openFile: (options) => ipcRenderer.invoke('open-file', options),
  exportImage: (options) => ipcRenderer.invoke('export-image', options),

  // Dialog operations
  showMessage: (options) => ipcRenderer.invoke('show-message', options),
  showConfirm: (options) => ipcRenderer.invoke('show-confirm', options),

  // Menu events
  onMenuNew: (callback) => {
    ipcRenderer.on('menu-new', callback);
    return () => ipcRenderer.removeListener('menu-new', callback);
  },
  onMenuOpen: (callback) => {
    ipcRenderer.on('menu-open', callback);
    return () => ipcRenderer.removeListener('menu-open', callback);
  },
  onMenuSave: (callback) => {
    ipcRenderer.on('menu-save', callback);
    return () => ipcRenderer.removeListener('menu-save', callback);
  },
  onMenuSaveAs: (callback) => {
    ipcRenderer.on('menu-save-as', callback);
    return () => ipcRenderer.removeListener('menu-save-as', callback);
  },
  onMenuUndo: (callback) => {
    ipcRenderer.on('menu-undo', callback);
    return () => ipcRenderer.removeListener('menu-undo', callback);
  },
  onMenuRedo: (callback) => {
    ipcRenderer.on('menu-redo', callback);
    return () => ipcRenderer.removeListener('menu-redo', callback);
  },
  onMenuExport: (callback) => {
    ipcRenderer.on('menu-export', (event, format) => callback(event, format));
    return () => ipcRenderer.removeListener('menu-export', callback);
  },
  onMenuAutoLayout: (callback) => {
    ipcRenderer.on('menu-auto-layout', callback);
    return () => ipcRenderer.removeListener('menu-auto-layout', callback);
  },

  // Check if running in Electron
  isElectron: true,
});
