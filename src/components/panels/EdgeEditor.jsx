import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Dropdown from '../ui/Dropdown';
import { X, Trash2, Plus } from 'lucide-react';
import { EDGE_TYPES } from '../../constants/colors';

const EdgeEditor = ({ edge, onUpdate, onDelete, onClose }) => {
  const [label, setLabel] = useState(edge.label || '');
  const [animated, setAnimated] = useState(edge.animated || false);
  const [edgeType, setEdgeType] = useState(edge.data?.type || 'smoothstep');
  const [directionType, setDirectionType] = useState(edge.data?.directionType || 'bidirectional');
  const [connectionType, setConnectionType] = useState(edge.data?.connectionType || 'none');

  // Separate parameters for request and response
  const [requestLabel, setRequestLabel] = useState(edge.data?.requestLabel || 'request');
  const [responseLabel, setResponseLabel] = useState(edge.data?.responseLabel || 'response');
  const [requestParameters, setRequestParameters] = useState(edge.data?.requestParameters || []);
  const [responseParameters, setResponseParameters] = useState(edge.data?.responseParameters || []);
  const [newRequestParameter, setNewRequestParameter] = useState('');
  const [newResponseParameter, setNewResponseParameter] = useState('');

  useEffect(() => {
    setLabel(edge.label || '');
    setAnimated(edge.animated || false);
    setEdgeType(edge.data?.type || 'smoothstep');
    setDirectionType(edge.data?.directionType || 'bidirectional');
    setConnectionType(edge.data?.connectionType || 'none');
    setRequestLabel(edge.data?.requestLabel || 'request');
    setResponseLabel(edge.data?.responseLabel || 'response');
    setRequestParameters(edge.data?.requestParameters || []);
    setResponseParameters(edge.data?.responseParameters || []);
  }, [edge]);

  // Update edge whenever any field changes
  useEffect(() => {
    onUpdate(edge.id, {
      ...edge,
      label,
      animated,
      type: 'custom', // ALWAYS 'custom' for ReactFlow edgeTypes registry
      data: {
        ...edge.data,
        label,
        type: edgeType, // Visual style type (smoothstep, bezier, straight)
        directionType,
        connectionType,
        requestLabel,
        responseLabel,
        requestParameters,
        responseParameters,
      },
    });
  }, [edge.id, label, animated, edgeType, directionType, connectionType, requestLabel, responseLabel, requestParameters, responseParameters, onUpdate]);

  const handleAddRequestParameter = () => {
    if (newRequestParameter.trim()) {
      setRequestParameters([...requestParameters, newRequestParameter.trim()]);
      setNewRequestParameter('');
    }
  };

  const handleRemoveRequestParameter = (index) => {
    setRequestParameters(requestParameters.filter((_, i) => i !== index));
  };

  const handleAddResponseParameter = () => {
    if (newResponseParameter.trim()) {
      setResponseParameters([...responseParameters, newResponseParameter.trim()]);
      setNewResponseParameter('');
    }
  };

  const handleRemoveResponseParameter = (index) => {
    setResponseParameters(responseParameters.filter((_, i) => i !== index));
  };

  const handleRequestKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRequestParameter();
    }
  };

  const handleResponseKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddResponseParameter();
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

        {/* Direction Type */}
        <Dropdown
          label="Flow Direction"
          options={[
            { label: '→ Unidirectional (Single Line)', value: 'unidirectional' },
            { label: '↔ Bidirectional (Two Lines)', value: 'bidirectional' },
          ]}
          value={directionType}
          onChange={setDirectionType}
        />

        {/* Edge Type */}
        <Dropdown
          label="Connection Style"
          options={EDGE_TYPES.map((type) => ({ label: type.name, value: type.value }))}
          value={edgeType}
          onChange={setEdgeType}
        />

        {/* REQUEST PARAMETERS */}
        <div className="space-y-2 border border-blue-200 rounded-lg p-3 bg-blue-50">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-blue-900">→ Request Parameters</label>
          </div>

          {/* Request Label */}
          <Input
            label="Request Line Label"
            value={requestLabel}
            onChange={(e) => setRequestLabel(e.target.value)}
            placeholder="e.g., http request"
            className="text-sm"
          />

          {/* Add Request Parameter Input */}
          <div className="flex gap-2">
            <Input
              value={newRequestParameter}
              onChange={(e) => setNewRequestParameter(e.target.value)}
              onKeyPress={handleRequestKeyPress}
              placeholder="e.g., userId, sessionToken"
              className="flex-1"
            />
            <Button
              onClick={handleAddRequestParameter}
              variant="secondary"
              size="sm"
              icon={<Plus size={16} />}
            >
              Add
            </Button>
          </div>

          {/* Request Parameters List */}
          {requestParameters.length > 0 ? (
            <div className="space-y-1 mt-2">
              {requestParameters.map((param, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white border border-blue-200 rounded px-3 py-2"
                >
                  <span className="text-sm font-mono text-gray-800">{param}</span>
                  <button
                    onClick={() => handleRemoveRequestParameter(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-blue-600 italic mt-2 p-2 bg-blue-100 rounded border border-blue-200">
              Add parameters sent in the request
            </div>
          )}
        </div>

        {/* RESPONSE PARAMETERS */}
        <div className="space-y-2 border border-green-200 rounded-lg p-3 bg-green-50">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-green-900">← Response Parameters</label>
          </div>

          {/* Response Label */}
          <Input
            label="Response Line Label"
            value={responseLabel}
            onChange={(e) => setResponseLabel(e.target.value)}
            placeholder="e.g., http response"
            className="text-sm"
          />

          {/* Add Response Parameter Input */}
          <div className="flex gap-2">
            <Input
              value={newResponseParameter}
              onChange={(e) => setNewResponseParameter(e.target.value)}
              onKeyPress={handleResponseKeyPress}
              placeholder="e.g., user, email, status"
              className="flex-1"
            />
            <Button
              onClick={handleAddResponseParameter}
              variant="secondary"
              size="sm"
              icon={<Plus size={16} />}
            >
              Add
            </Button>
          </div>

          {/* Response Parameters List */}
          {responseParameters.length > 0 ? (
            <div className="space-y-1 mt-2">
              {responseParameters.map((param, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white border border-green-200 rounded px-3 py-2"
                >
                  <span className="text-sm font-mono text-gray-800">{param}</span>
                  <button
                    onClick={() => handleRemoveResponseParameter(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-green-600 italic mt-2 p-2 bg-green-100 rounded border border-green-200">
              Add parameters returned in the response
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

        {/* Visual Preview */}
        {(requestParameters.length > 0 || responseParameters.length > 0) && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-gray-300 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-700 mb-3">
              Preview on Diagram:
            </p>
            <div className="space-y-3">
              {/* Request Preview */}
              {requestParameters.length > 0 && (
                <div className="inline-block px-3 py-2 bg-blue-50 border-blue-300 text-blue-900 border-2 rounded-lg shadow-sm text-xs font-medium">
                  <div className="font-semibold flex items-center gap-1 mb-1">
                    <span className="text-base">→</span>
                    <span>{requestLabel}</span>
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-current border-opacity-20">
                    <div className="text-[10px] opacity-60 mb-0.5 uppercase tracking-wide">
                      Parameters
                    </div>
                    <div className="font-mono text-xs opacity-90">
                      {requestParameters.map((param, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <span className="opacity-50">•</span>
                          <span className="font-semibold">{param}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Response Preview */}
              {responseParameters.length > 0 && (
                <div className="inline-block px-3 py-2 bg-green-50 border-green-300 text-green-900 border-2 rounded-lg shadow-sm text-xs font-medium">
                  <div className="font-semibold flex items-center gap-1 mb-1">
                    <span className="text-base">←</span>
                    <span>{responseLabel}</span>
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-current border-opacity-20">
                    <div className="text-[10px] opacity-60 mb-0.5 uppercase tracking-wide">
                      Parameters
                    </div>
                    <div className="font-mono text-xs opacity-90">
                      {responseParameters.map((param, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <span className="opacity-50">•</span>
                          <span className="font-semibold">{param}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
