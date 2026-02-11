# Diagram Editor

A complete, production-ready **System/Platform Diagram Editor** built as a desktop application using Electron, React, and React Flow. Create, edit, and export system architecture diagrams with an intuitive drag-and-drop interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

### Core Functionality
- **Visual Diagram Editor**: Create system architecture diagrams with draggable platform nodes
- **Custom Nodes**: Platform nodes with editable names, colors, and key-value attributes
- **Connections**: Draw connections between nodes with labels and animation options
- **Auto-Layout**: Automatic diagram arrangement using dagre algorithm (TB, LR, RL, BT)
- **Collision Detection**: Prevents node overlap with automatic repositioning
- **Undo/Redo**: Full history support (up to 50 actions) with keyboard shortcuts

### Interactive Controls
- **Drag & Drop**: Move nodes anywhere on the canvas
- **Multi-Select**: Select multiple elements with Shift+Click or drag selection
- **Keyboard Shortcuts**:
  - `Ctrl+Z` / `Cmd+Z`: Undo
  - `Ctrl+Shift+Z` / `Cmd+Shift+Z`: Redo
  - `Ctrl+S` / `Cmd+S`: Save
  - `Ctrl+O` / `Cmd+O`: Open
  - `Ctrl+N` / `Cmd+N`: New
  - `Delete` / `Backspace`: Delete selected element
- **Canvas Controls**: Zoom, pan, fit view, minimap

### File Operations
- **Save/Open**: Native file dialogs for saving and opening diagrams
- **Recent Files**: Track recently opened files
- **Import Formats**: JSON, XML
- **Export Formats**:
  - Images: PNG (2x resolution), JPG, SVG
  - Documents: PDF
  - Data: JSON, XML

### Desktop Features
- **Native Menus**: Full menu bar integration (File, Edit, View, Help)
- **Cross-Platform**: Builds for Windows, macOS, and Linux
- **Standalone**: Runs without Node.js or development tools installed

## Technology Stack

### Core
- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **React Flow v11**: Diagramming engine
- **Electron**: Desktop runtime
- **Tailwind CSS**: Styling

### Libraries
- **dagre**: Auto-layout algorithm
- **html-to-image**: Image export (PNG, JPG, SVG)
- **jsPDF**: PDF export
- **lucide-react**: Icon set

### Build Tools
- **electron-builder**: Cross-platform packaging
- **concurrently**: Run multiple commands
- **wait-on**: Wait for dev server

## Installation

### Prerequisites
- **Node.js**: v18 or higher
- **npm**: v8 or higher

### Setup

1. **Clone or extract the project**:
   ```bash
   cd diagram-editor
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

   This will install all required packages including React, Electron, React Flow, and build tools.

## Development

### Run in Development Mode

**Option 1: React only (web browser)**
```bash
npm run dev
```
Opens in browser at `http://localhost:5173`

**Option 2: Electron + React (desktop app)**
```bash
npm run electron:dev
```
This will:
1. Start the Vite dev server
2. Wait for it to be ready
3. Launch the Electron app
4. Open DevTools automatically

### Development Tips
- Hot reload is enabled - changes appear instantly
- DevTools are open by default in Electron dev mode
- Use React DevTools browser extension for debugging

## Building for Production

### Build for All Platforms
```bash
npm run electron:build
```

### Platform-Specific Builds

**Windows**:
```bash
npm run electron:build:win
```
Creates:
- `release/Diagram Editor Setup x.x.x.exe` (installer)
- `release/Diagram Editor x.x.x.exe` (portable)

**macOS**:
```bash
npm run electron:build:mac
```
Creates:
- `release/Diagram Editor-x.x.x.dmg` (disk image)
- `release/Diagram Editor-x.x.x-mac.zip` (archive)

**Linux**:
```bash
npm run electron:build:linux
```
Creates:
- `release/Diagram Editor-x.x.x.AppImage` (portable)
- `release/diagram-editor_x.x.x_amd64.deb` (Debian/Ubuntu)

### Build Output
All builds are created in the `release/` directory.

## Usage Guide

### Creating a Diagram

1. **Add Nodes**:
   - Click "Add Platform" in the sidebar
   - Or use File → New to start fresh

2. **Edit Nodes**:
   - Click a node to open the editor panel
   - Change name, color, and attributes
   - Add custom key-value pairs

3. **Create Connections**:
   - Drag from a node's handle (dot) to another node
   - Click the connection to edit label and style

4. **Arrange Diagram**:
   - Drag nodes to position manually
   - Or use "Auto Layout" for automatic arrangement

### Saving and Exporting

**Save Diagram**:
- File → Save (Ctrl+S) - Quick save
- File → Save As (Ctrl+Shift+S) - Save with new name

**Export Options**:
- File → Export → PNG - High-resolution image
- File → Export → JPG - Compressed image
- File → Export → SVG - Vector format (scalable)
- File → Export → PDF - Document format
- File → Export → XML - Structured data format

### Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New | Ctrl+N | Cmd+N |
| Open | Ctrl+O | Cmd+O |
| Save | Ctrl+S | Cmd+S |
| Save As | Ctrl+Shift+S | Cmd+Shift+S |
| Undo | Ctrl+Z | Cmd+Z |
| Redo | Ctrl+Shift+Z | Cmd+Shift+Z |
| Delete | Delete/Backspace | Delete/Backspace |
| Auto Layout | Ctrl+L | Cmd+L |

## Project Structure

```
diagram-editor/
├── electron/               # Electron main process
│   ├── main.js            # Main entry point
│   ├── preload.js         # IPC bridge
│   └── menu.js            # Native menu configuration
├── public/                # Static assets
│   └── icon.png           # App icon (512x512)
├── src/
│   ├── components/
│   │   ├── nodes/         # Custom node components
│   │   ├── edges/         # Custom edge components
│   │   ├── panels/        # Sidebar, toolbar, editors
│   │   └── ui/            # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── constants/         # Constants and initial data
│   ├── App.jsx            # Main application
│   ├── index.jsx          # React entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
└── README.md              # This file
```

## Configuration

### Electron Builder
Edit `package.json` → `build` section to customize:
- App ID and name
- Icon paths
- Build targets per platform
- Installer options

### Vite
Edit `vite.config.js` for:
- Build output directory
- Dev server port
- Path aliases

### Tailwind CSS
Edit `tailwind.config.js` for:
- Custom colors
- Custom animations
- Theme extensions

## Troubleshooting

### Port 5173 Already in Use
```bash
# Kill the process using port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5173 | xargs kill -9
```

### Electron Not Starting
- Ensure all dependencies are installed: `npm install`
- Try clearing cache: `rm -rf node_modules dist && npm install`
- Check that port 5173 is available

### Build Fails
- Ensure you have enough disk space (1GB+ free)
- On macOS, you may need to install Xcode Command Line Tools
- On Linux, you may need to install additional dependencies:
  ```bash
  sudo apt-get install -y libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libappindicator3-1 libsecret-1-0
  ```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Acknowledgments

- Built with [React Flow](https://reactflow.dev/)
- Icons from [Lucide](https://lucide.dev/)
- Layout algorithm by [dagre](https://github.com/dagrejs/dagre)
- Desktop runtime by [Electron](https://www.electronjs.org/)

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Refer to React Flow documentation for advanced customization

## Roadmap

Future enhancements could include:
- Dark mode support
- Cloud sync
- Collaborative editing
- Template library
- Custom node shapes
- Snap-to-grid toggle
- Diagram versioning
- Import from draw.io/Miro

---

**Built with ❤️ using React, Electron, and React Flow**
