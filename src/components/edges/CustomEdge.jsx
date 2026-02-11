import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, getSmoothStepPath, getStraightPath } from 'reactflow';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) => {
  const {
    label = '',
    type = 'smoothstep',
    connectionType = 'request',
    parameters = []
  } = data || {};

  // Define colors based on connection type
  const connectionColors = {
    request: {
      stroke: '#3b82f6', // blue
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-900',
      selectedBorder: 'border-blue-500',
    },
    response: {
      stroke: '#10b981', // green
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-900',
      selectedBorder: 'border-green-500',
    },
  };

  const colors = connectionColors[connectionType] || connectionColors.request;

  let edgePath, labelX, labelY;

  // Get the appropriate path based on type
  if (type === 'smoothstep') {
    [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  } else if (type === 'straight') {
    [edgePath, labelX, labelY] = getStraightPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });
  } else {
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  }

  // Format parameters for display
  const parametersText = parameters.length > 0 ? parameters.join(', ') : null;
  const displayLabel = label || (connectionType === 'request' ? 'Request' : 'Response');

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={{
          ...markerEnd,
          color: colors.stroke,
        }}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: selected ? colors.stroke : colors.stroke,
          strokeDasharray: connectionType === 'response' ? '5,5' : undefined,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            className={`px-2 py-1 ${colors.bg} border ${
              selected ? colors.selectedBorder : colors.border
            } rounded shadow-sm text-xs font-medium ${colors.text}`}
          >
            <div className="font-semibold">{displayLabel}</div>
            {parametersText && (
              <div className="text-xs mt-1 opacity-90 font-mono">
                {parametersText}
              </div>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
