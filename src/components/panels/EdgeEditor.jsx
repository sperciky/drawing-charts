import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Dropdown from '../ui/Dropdown';
import { X, Trash2 } from 'lucide-react';
import { EDGE_TYPES } from '../../constants/colors';

const EdgeEditor = ({ edge, onUpdate, onDelete, onClose }) => {
  const [label, setLabel] = useState(edge.label || '');
  const [animated, setAnimated] = useState(edge.animated || false);
  const [edgeType, setEdgeType] = useState(edge.type || 'smoothstep');

  useEffect(() => {
    setLabel(edge.label || '');
    setAnimated(edge.animated || false);
    setEdgeType(edge.type || 'smoothstep');
  }, [edge]);

  const handleUpdate = () => {
    onUpdate(edge.id, {
      ...edge,
      label,
      animated,
      type: edgeType,
    });
  };

  useEffect(() => {
    handleUpdate();
  }, [label, animated, edgeType]);

  const handleDeleteEdge = () => {
    if (window.confirm('Are you sure you want to delete this connection?')) {
      onDelete(edge.id);
      onClose();
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Edit Connection</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Label */}
        <Input
          label="Connection Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., HTTP/REST, SQL Query"
        />

        {/* Edge Type */}
        <Dropdown
          label="Connection Type"
          options={EDGE_TYPES.map((type) => ({ label: type.name, value: type.value }))}
          value={edgeType}
          onChange={setEdgeType}
        />

        {/* Animated */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Animated</label>
          <button
            onClick={() => setAnimated(!animated)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              animated ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                animated ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
          <p className="font-medium mb-1">Connection Info:</p>
          <p>
            From: <span className="font-mono">{edge.source}</span>
          </p>
          <p>
            To: <span className="font-mono">{edge.target}</span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200">
        <Button
          onClick={handleDeleteEdge}
          variant="danger"
          size="md"
          icon={<Trash2 size={16} />}
          className="w-full"
        >
          Delete Connection
        </Button>
      </div>
    </div>
  );
};

export default EdgeEditor;
