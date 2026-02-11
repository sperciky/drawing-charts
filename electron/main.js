const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../public/icon.png'),
    title: 'Diagram Editor',
    backgroundColor: '#ffffff',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Set up native menu
  const menu = require('./menu')(mainWindow);
  Menu.setApplicationMenu(menu);

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers for file operations
ipcMain.handle('save-file', async (event, { data, defaultName, filters }) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Diagram',
      defaultPath: defaultName || 'diagram.json',
      filters: filters || [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'XML Files', extensions: ['xml'] },
      ],
    });

    if (filePath) {
      fs.writeFileSync(filePath, data, 'utf-8');
      return { success: true, filePath };
    }
    return { success: false };
  } catch (error) {
    console.error('Error saving file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-file', async (event, { filters }) => {
  try {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Open Diagram',
      filters: filters || [
        { name: 'Diagram Files', extensions: ['json', 'xml'] },
      ],
      properties: ['openFile'],
    });

    if (filePaths.length > 0) {
      const content = fs.readFileSync(filePaths[0], 'utf-8');
      return { success: true, content, filePath: filePaths[0] };
    }
    return { success: false };
  } catch (error) {
    console.error('Error opening file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('export-image', async (event, { data, defaultName, format }) => {
  try {
    const filters = {
      png: [{ name: 'PNG Image', extensions: ['png'] }],
      jpg: [{ name: 'JPEG Image', extensions: ['jpg', 'jpeg'] }],
      svg: [{ name: 'SVG Image', extensions: ['svg'] }],
      pdf: [{ name: 'PDF Document', extensions: ['pdf'] }],
    };

    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: `Export as ${format.toUpperCase()}`,
      defaultPath: defaultName || `diagram.${format}`,
      filters: filters[format] || [{ name: 'All Files', extensions: ['*'] }],
    });

    if (filePath) {
      let buffer;
      if (data.startsWith('data:')) {
        // Base64 encoded data
        buffer = Buffer.from(data.split(',')[1], 'base64');
      } else {
        // Raw data (SVG, XML, etc.)
        buffer = Buffer.from(data, 'utf-8');
      }
      fs.writeFileSync(filePath, buffer);
      return { success: true, filePath };
    }
    return { success: false };
  } catch (error) {
    console.error('Error exporting image:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-message', async (event, { title, message, type }) => {
  const options = {
    type: type || 'info',
    title: title || 'Message',
    message: message || '',
    buttons: ['OK'],
  };

  await dialog.showMessageBox(mainWindow, options);
  return { success: true };
});

ipcMain.handle('show-confirm', async (event, { title, message }) => {
  const options = {
    type: 'question',
    title: title || 'Confirm',
    message: message || '',
    buttons: ['Yes', 'No'],
    defaultId: 0,
    cancelId: 1,
  };

  const { response } = await dialog.showMessageBox(mainWindow, options);
  return { confirmed: response === 0 };
});
