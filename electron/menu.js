const { Menu, shell } = require('electron');

module.exports = function (mainWindow) {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Diagram',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu-new'),
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.send('menu-open'),
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu-save'),
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow.webContents.send('menu-save-as'),
        },
        { type: 'separator' },
        {
          label: 'Export',
          submenu: [
            {
              label: 'Export as PNG',
              click: () => mainWindow.webContents.send('menu-export', 'png'),
            },
            {
              label: 'Export as JPG',
              click: () => mainWindow.webContents.send('menu-export', 'jpg'),
            },
            {
              label: 'Export as SVG',
              click: () => mainWindow.webContents.send('menu-export', 'svg'),
            },
            {
              label: 'Export as PDF',
              click: () => mainWindow.webContents.send('menu-export', 'pdf'),
            },
            { type: 'separator' },
            {
              label: 'Export as XML',
              click: () => mainWindow.webContents.send('menu-export', 'xml'),
            },
          ],
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          click: () => mainWindow.webContents.send('menu-undo'),
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: () => mainWindow.webContents.send('menu-redo'),
        },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Auto Layout',
          accelerator: 'CmdOrCtrl+L',
          click: () => mainWindow.webContents.send('menu-auto-layout'),
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/your-repo/diagram-editor');
          },
        },
        { type: 'separator' },
        {
          label: 'About Diagram Editor',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Diagram Editor',
              message: 'Diagram Editor v1.0.0',
              detail:
                'A visual tool for creating system architecture diagrams.\n\nBuilt with Electron, React, and React Flow.',
              buttons: ['OK'],
            });
          },
        },
      ],
    },
  ];

  // Add macOS-specific menu items
  if (process.platform === 'darwin') {
    template.unshift({
      label: 'Diagram Editor',
      submenu: [
        {
          label: 'About Diagram Editor',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Diagram Editor',
              message: 'Diagram Editor v1.0.0',
              detail:
                'A visual tool for creating system architecture diagrams.\n\nBuilt with Electron, React, and React Flow.',
              buttons: ['OK'],
            });
          },
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  return Menu.buildFromTemplate(template);
};
