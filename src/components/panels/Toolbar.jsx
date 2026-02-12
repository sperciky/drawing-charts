import React, { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';
import {
  FileText,
  FolderOpen,
  Save,
  Undo2,
  Redo2,
  Layout,
  Download,
  ChevronDown,
  Bug,
  Map,
} from 'lucide-react';

const Toolbar = ({
  onNew,
  onOpen,
  onSave,
  onUndo,
  onRedo,
  onAutoLayout,
  onExport,
  canUndo,
  canRedo,
  debugMode,
  onDebugModeToggle,
  showMiniMap,
  onMiniMapToggle,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const exportRef = useRef(null);
  const layoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
      if (layoutRef.current && !layoutRef.current.contains(event.target)) {
        setShowLayoutMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportFormats = [
    { label: 'Export as HTML (Shareable)', value: 'html' },
    { label: 'Export as PNG', value: 'png' },
    { label: 'Export as JPG', value: 'jpg' },
    { label: 'Export as SVG', value: 'svg' },
    { label: 'Export as PDF', value: 'pdf' },
    { label: 'Export as XML', value: 'xml' },
  ];

  const layoutDirections = [
    { label: 'Top to Bottom', value: 'TB' },
    { label: 'Left to Right', value: 'LR' },
    { label: 'Right to Left', value: 'RL' },
    { label: 'Bottom to Top', value: 'BT' },
  ];

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-2">
      {/* File Operations */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
        <Button onClick={onNew} variant="ghost" size="sm" icon={<FileText size={16} />}>
          New
        </Button>
        <Button onClick={onOpen} variant="ghost" size="sm" icon={<FolderOpen size={16} />}>
          Open
        </Button>
        <Button onClick={onSave} variant="ghost" size="sm" icon={<Save size={16} />}>
          Save
        </Button>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
        <Button
          onClick={onUndo}
          variant="ghost"
          size="sm"
          icon={<Undo2 size={16} />}
          disabled={!canUndo}
        >
          Undo
        </Button>
        <Button
          onClick={onRedo}
          variant="ghost"
          size="sm"
          icon={<Redo2 size={16} />}
          disabled={!canRedo}
        >
          Redo
        </Button>
      </div>

      {/* Layout */}
      <div className="relative" ref={layoutRef}>
        <Button
          onClick={() => setShowLayoutMenu(!showLayoutMenu)}
          variant="ghost"
          size="sm"
          icon={<Layout size={16} />}
        >
          Auto Layout
          <ChevronDown size={14} />
        </Button>

        {showLayoutMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] z-10">
            {layoutDirections.map((direction) => (
              <button
                key={direction.value}
                onClick={() => {
                  onAutoLayout(direction.value);
                  setShowLayoutMenu(false);
                }}
                className="w-full px-4 py-2 text-sm text-left hover:bg-blue-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {direction.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Export */}
      <div className="relative" ref={exportRef}>
        <Button
          onClick={() => setShowExportMenu(!showExportMenu)}
          variant="ghost"
          size="sm"
          icon={<Download size={16} />}
        >
          Export
          <ChevronDown size={14} />
        </Button>

        {showExportMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] z-10">
            {exportFormats.map((format) => (
              <button
                key={format.value}
                onClick={() => {
                  onExport(format.value);
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-2 text-sm text-left hover:bg-blue-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {format.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Settings Checkboxes */}
      <div className="flex items-center gap-3 pl-2 border-l border-gray-300">
        {/* Debug Logging */}
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={debugMode}
            onChange={(e) => onDebugModeToggle(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <div className="flex items-center gap-1.5 text-sm text-gray-700 group-hover:text-gray-900">
            <Bug size={14} className="text-gray-500 group-hover:text-gray-700" />
            <span>Debug</span>
          </div>
        </label>

        {/* MiniMap Toggle */}
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={showMiniMap}
            onChange={(e) => onMiniMapToggle(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <div className="flex items-center gap-1.5 text-sm text-gray-700 group-hover:text-gray-900">
            <Map size={14} className="text-gray-500 group-hover:text-gray-700" />
            <span>MiniMap</span>
          </div>
        </label>
      </div>

      <div className="flex-1" />

      {/* Status */}
      <div className="text-xs text-gray-500">
        {canUndo && <span>Changes saved</span>}
      </div>
    </div>
  );
};

export default Toolbar;
