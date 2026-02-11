import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Dropdown from '../ui/Dropdown';
import { X, Trash2, Plus } from 'lucide-react';
import { EDGE_TYPES } from '../../constants/colors';

const EdgeEditor = ({ edge, onUpdate, onDelete, onClose }) => {
  const [label, setLabel] = useState(edge.label || '');
  const [animated, setAnimated] = useState(edge.animated || false);
  const [edgeType, setEdgeType] = useState(edge.type || 'smoothstep');
  const [connectionType, setConnectionType] = useState(edge.data?.connectionType || 'request');
  const [parameters, setParameters] = useState(edge.data?.parameters || []);
  const [newParameter, setNewParameter] = useState('');

  useEffect(() => {
    setLabel(edge.label || '');
    setAnimated(edge.animated || false);
    setEdgeType(edge.type || 'smoothstep');
    setConnectionType(edge.data?.connectionType || 'request');
    setParameters(edge.data?.parameters || []);
  }, [edge]);

  const handleUpdate = () => {
    onUpdate(edge.id, {
      ...edge,
      label,
      animated,
      type: edgeType,
      data: {
        ...edge.data,
        label,
        type: edgeType,
        connectionType,
        parameters,
      },
    });
  };

  useEffect(() => {
    handleUpdate();
  }, [label, animated, edgeType, connectionType, parameters]);

  const handleAddParameter = () => {
    if (newParameter.trim()) {
      setParameters([...parameters, newParameter.trim()]);
      setNewParameter('');
    }
  };

  const handleRemoveParameter = (index) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddParameter();
    }
  };

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

        {/* Connection Direction Type */}
        <Dropdown
          label="Direction Type"
          options={[
            { label: '→ Request', value: 'request' },
            { label: '← Response', value: 'response' },
          ]}
          value={connectionType}
          onChange={setConnectionType}
        />

        {/* Edge Type */}
        <Dropdown
          label="Connection Style"
          options={EDGE_TYPES.map((type) => ({ label: type.name, value: type.value }))}
          value={edgeType}
          onChange={setEdgeType}
        />

        {/* Parameters */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Parameters Delivered</label>

          {/* Add Parameter Input */}
          <div className="flex gap-2">
            <Input
              value={newParameter}
              onChange={(e) => setNewParameter(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., userId, productId"
              className="flex-1"
            />
            <Button
              onClick={handleAddParameter}
              variant="secondary"
              size="sm"
              icon={<Plus size={16} />}
            >
              Add
            </Button>
          </div>

          {/* Parameters List */}
          {parameters.length > 0 && (
            <div className="space-y-1 mt-2">
              {parameters.map((param, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2"
                >
                  <span className="text-sm font-mono text-gray-800">{param}</span>
                  <button
                    onClick={() => handleRemoveParameter(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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
