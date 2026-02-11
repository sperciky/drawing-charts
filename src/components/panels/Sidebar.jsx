import React from 'react';
import Button from '../ui/Button';
import { Plus, Info } from 'lucide-react';

const Sidebar = ({ onAddNode }) => {
  return (
    <div className="w-60 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Components</h2>
      </div>

      {/* Add Node Button */}
      <div className="px-4 py-4">
        <Button
          onClick={onAddNode}
          variant="primary"
          size="md"
          icon={<Plus size={18} />}
          className="w-full"
        >
          Add Platform
        </Button>
      </div>

      {/* Instructions */}
      <div className="px-4 py-4 flex-1">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 space-y-2">
              <p className="font-semibold">Quick Guide:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Click a node to edit</li>
                <li>Drag nodes to move</li>
                <li>Drag from handles to connect</li>
                <li>Press Delete to remove</li>
                <li>Ctrl+Z/Y to undo/redo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-3 border-t border-gray-200 text-xs text-gray-500">
        <p>Diagram Editor v1.0.0</p>
        <p className="mt-1">Built with React Flow</p>
      </div>
    </div>
  );
};

export default Sidebar;
