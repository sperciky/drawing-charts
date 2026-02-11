// IPC utility for Electron communication
import { isElectron } from './helpers';

export const electronAPI = {
  // Check if running in Electron
  isAvailable: () => isElectron(),

  // File operations
  saveFile: async (data, defaultName, filters) => {
    if (!isElectron()) {
      console.warn('Electron API not available');
      return { success: false, error: 'Not running in Electron' };
    }
    return window.electronAPI.saveFile({ data, defaultName, filters });
  },

  openFile: async (filters) => {
    if (!isElectron()) {
      console.warn('Electron API not available');
      return { success: false, error: 'Not running in Electron' };
    }
    return window.electronAPI.openFile({ filters });
  },

  exportImage: async (data, defaultName, format) => {
    if (!isElectron()) {
      console.warn('Electron API not available');
      return { success: false, error: 'Not running in Electron' };
    }
    return window.electronAPI.exportImage({ data, defaultName, format });
  },

  // Dialog operations
  showMessage: async (title, message, type = 'info') => {
    if (!isElectron()) {
      alert(`${title}\n\n${message}`);
      return { success: true };
    }
    return window.electronAPI.showMessage({ title, message, type });
  },

  showConfirm: async (title, message) => {
    if (!isElectron()) {
      const confirmed = confirm(`${title}\n\n${message}`);
      return { confirmed };
    }
    return window.electronAPI.showConfirm({ title, message });
  },

  // Menu event listeners
  onMenuNew: (callback) => {
    if (!isElectron()) return () => {};
    return window.electronAPI.onMenuNew(callback);
  },

  onMenuOpen: (callback) => {
    if (!isElectron()) return () => {};
    return window.electronAPI.onMenuOpen(callback);
  },

  onMenuSave: (callback) => {
    if (!isElectron()) return () => {};
    return window.electronAPI.onMenuSave(callback);
  },

  onMenuSaveAs: (callback) => {
    if (!isElectron()) return () => {};
    return window.electronAPI.onMenuSaveAs(callback);
  },

  onMenuUndo: (callback) => {
    if (!isElectron()) return () => {};
    return window.electronAPI.onMenuUndo(callback);
  },

  onMenuRedo: (callback) => {
    if (!isElectron()) return () => {};
    return window.electronAPI.onMenuRedo(callback);
  },

  onMenuExport: (callback) => {
    if (!isElectron()) return () => {};
    return window.electronAPI.onMenuExport(callback);
  },

  onMenuAutoLayout: (callback) => {
    if (!isElectron()) return () => {};
    return window.electronAPI.onMenuAutoLayout(callback);
  },
};
