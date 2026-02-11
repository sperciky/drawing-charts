import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, getSmoothStepPath, getStraightPath, MarkerType } from 'reactflow';

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
  sourceHandleId,
  targetHandleId,
}) => {
  const {
    label = '',
    type = 'smoothstep',
    directionType = 'unidirectional',
    connectionType = 'request',
    parameters = []
  } = data || {};

  // Define colors based on direction and connection type
  const getColors = () => {
    if (directionType === 'bidirectional') {
      return {
        stroke: '#8b5cf6', // purple for bidirectional
        bg: 'bg-purple-50',
        border: 'border-purple-300',
        text: 'text-purple-900',
        selectedBorder: 'border-purple-500',
      };
    }

    if (directionType === 'request-response') {
      if (connectionType === 'response') {
        return {
          stroke: '#10b981', // green for response
          bg: 'bg-green-50',
          border: 'border-green-300',
          text: 'text-green-900',
          selectedBorder: 'border-green-500',
        };
      }
      return {
        stroke: '#3b82f6', // blue for request
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        text: 'text-blue-900',
        selectedBorder: 'border-blue-500',
      };
    }

    // Default unidirectional
    return {
      stroke: '#6b7280', // gray
      bg: 'bg-gray-50',
      border: 'border-gray-300',
      text: 'text-gray-900',
      selectedBorder: 'border-gray-500',
    };
  };

  const colors = getColors();

  // Calculate offset for request-response pairs
  const calculateOffset = () => {
    if (directionType === 'request-response') {
      const offset = connectionType === 'request' ? 15 : -15;
      return offset;
    }
    return 0;
  };

  const offset = calculateOffset();

  // Apply offset for parallel connections
  const applyOffset = (x, y, isSource) => {
    if (offset === 0) return { x, y };

    // Calculate perpendicular offset
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) return { x, y };

    // Perpendicular vector
    const perpX = -dy / length;
    const perpY = dx / length;

    return {
      x: x + perpX * offset,
      y: y + perpY * offset
    };
  };

  const sourceOffset = applyOffset(sourceX, sourceY, true);
  const targetOffset = applyOffset(targetX, targetY, false);

  let edgePath, labelX, labelY;

  // Get the appropriate path based on type
  if (type === 'smoothstep') {
    [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX: sourceOffset.x,
      sourceY: sourceOffset.y,
      sourcePosition,
      targetX: targetOffset.x,
      targetY: targetOffset.y,
      targetPosition,
    });
  } else if (type === 'straight') {
    [edgePath, labelX, labelY] = getStraightPath({
      sourceX: sourceOffset.x,
      sourceY: sourceOffset.y,
      targetX: targetOffset.x,
      targetY: targetOffset.y,
    });
  } else {
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX: sourceOffset.x,
      sourceY: sourceOffset.y,
      sourcePosition,
      targetX: targetOffset.x,
      targetY: targetOffset.y,
      targetPosition,
    });
  }

  // Format parameters for display
  const parametersText = parameters.length > 0 ? parameters.join(', ') : null;

  // Determine display label based on direction type
  const getDisplayLabel = () => {
    if (label) return label;

    if (directionType === 'bidirectional') return 'Bidirectional';
    if (directionType === 'request-response') {
      return connectionType === 'request' ? 'Request' : 'Response';
    }
    return '';
  };

  const displayLabel = getDisplayLabel();

  // Determine marker configuration
  const getMarkers = () => {
    const marker = {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: colors.stroke,
    };

    if (directionType === 'bidirectional') {
      return {
        markerStart: marker,
        markerEnd: marker,
      };
    }

    return {
      markerEnd: marker,
    };
  };

  const markers = getMarkers();

  // Calculate label offset for request-response pairs
  const labelOffset = directionType === 'request-response' ? offset : 0;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerStart={markers.markerStart}
        markerEnd={markers.markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: colors.stroke,
          strokeDasharray:
            directionType === 'request-response' && connectionType === 'response'
              ? '5,5'
              : undefined,
        }}
      />
      {displayLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY + labelOffset}px)`,
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
      )}
    </>
  );
};

export default CustomEdge;
