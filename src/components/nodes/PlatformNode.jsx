import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Box } from 'lucide-react';

const PlatformNode = ({ data, selected }) => {
  const { name, color, attributes = [] } = data;

  return (
    <div
      className={`bg-white rounded-lg shadow-lg transition-all duration-200 min-w-[250px] ${
        selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      style={{ minHeight: '150px' }}
    >
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
        style={{ top: -6 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
        style={{ bottom: -6 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
        style={{ left: -6 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
        style={{ right: -6 }}
      />

      {/* Header */}
      <div
        className="px-4 py-3 rounded-t-lg flex items-center gap-2"
        style={{ backgroundColor: color }}
      >
        <Box size={20} className="text-white flex-shrink-0" />
        <h3 className="text-white font-semibold text-base truncate">{name}</h3>
      </div>

      {/* Attributes */}
      {attributes.length > 0 && (
        <div className="px-4 py-3 space-y-2">
          {attributes.map((attr) => (
            <div key={attr.id} className="flex items-start gap-2 text-sm">
              <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                {attr.key}:
              </span>
              <span className="text-gray-600 truncate">{attr.value}</span>
            </div>
          ))}
        </div>
      )}

      {attributes.length === 0 && (
        <div className="px-4 py-6 text-center text-gray-400 text-sm">No attributes</div>
      )}
    </div>
  );
};

export default memo(PlatformNode);
