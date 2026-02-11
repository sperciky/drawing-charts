import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ColorPicker from '../ui/ColorPicker';
import { X, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { generateId } from '../../utils/helpers';

const NodeEditor = ({ node, onUpdate, onDelete, onClose }) => {
  const [name, setName] = useState(node.data.name || '');
  const [color, setColor] = useState(node.data.color || '#3b82f6');
  const [attributes, setAttributes] = useState(node.data.attributes || []);

  useEffect(() => {
    setName(node.data.name || '');
    setColor(node.data.color || '#3b82f6');
    setAttributes(node.data.attributes || []);
  }, [node]);

  // Update node whenever name, color, or attributes change
  useEffect(() => {
    onUpdate(node.id, {
      name,
      color,
      attributes,
    });
  }, [name, color, attributes, node.id, onUpdate]);

  const handleAddAttribute = () => {
    setAttributes([
      ...attributes,
      { id: generateId(), key: 'New Key', value: 'New Value' },
    ]);
  };

  const handleUpdateAttribute = (id, field, value) => {
    setAttributes(
      attributes.map((attr) => (attr.id === id ? { ...attr, [field]: value } : attr))
    );
  };

  const handleDeleteAttribute = (id) => {
    setAttributes(attributes.filter((attr) => attr.id !== id));
  };

  const handleMoveAttribute = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === attributes.length - 1)
    ) {
      return;
    }
    const updated = [...attributes];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setAttributes(updated);
  };

  const handleDeleteNode = async () => {
    // Simple confirmation
    if (window.confirm('Are you sure you want to delete this node?')) {
      onDelete(node.id);
      onClose();
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Edit Platform</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Name */}
        <Input
          label="Platform Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter platform name"
        />

        {/* Color */}
        <ColorPicker label="Header Color" value={color} onChange={setColor} />

        {/* Attributes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Attributes</label>
            <Button
              onClick={handleAddAttribute}
              variant="ghost"
              size="sm"
              icon={<Plus size={14} />}
            >
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {attributes.map((attr, index) => (
              <div key={attr.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Attribute {index + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveAttribute(index, 'up')}
                      disabled={index === 0}
                      className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                        index === 0 ? 'opacity-30 cursor-not-allowed' : ''
                      }`}
                      title="Move up"
                    >
                      <ChevronUp size={14} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleMoveAttribute(index, 'down')}
                      disabled={index === attributes.length - 1}
                      className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                        index === attributes.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                      }`}
                      title="Move down"
                    >
                      <ChevronDown size={14} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteAttribute(attr.id)}
                      className="p-1 rounded hover:bg-red-100 transition-colors ml-1"
                      title="Delete attribute"
                    >
                      <Trash2 size={14} className="text-red-600" />
                    </button>
                  </div>
                </div>
                <Input
                  value={attr.key}
                  onChange={(e) => handleUpdateAttribute(attr.id, 'key', e.target.value)}
                  placeholder="Key"
                />
                <Input
                  value={attr.value}
                  onChange={(e) => handleUpdateAttribute(attr.id, 'value', e.target.value)}
                  placeholder="Value"
                />
              </div>
            ))}

            {attributes.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No attributes yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200">
        <Button
          onClick={handleDeleteNode}
          variant="danger"
          size="md"
          icon={<Trash2 size={16} />}
          className="w-full"
        >
          Delete Node
        </Button>
      </div>
    </div>
  );
};

export default NodeEditor;
