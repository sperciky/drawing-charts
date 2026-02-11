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

    // Unidirectional - check role
    if (connectionType === 'response') {
      return {
        stroke: '#10b981', // green for response
        bg: 'bg-green-50',
        border: 'border-green-300',
        text: 'text-green-900',
        selectedBorder: 'border-green-500',
      };
    }

    if (connectionType === 'request') {
      return {
        stroke: '#3b82f6', // blue for request
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        text: 'text-blue-900',
        selectedBorder: 'border-blue-500',
      };
    }

    // Default gray for none
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
    // Offset for any connection marked as request or response
    if (connectionType === 'request') return 15;
    if (connectionType === 'response') return -15;
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
    // For unidirectional, show role if it exists
    if (connectionType === 'request') return 'Request';
    if (connectionType === 'response') return 'Response';
    return 'Connection';
  };

  const displayLabel = getDisplayLabel();

  // Always show the label box if we have a label OR parameters
  const shouldShowLabel = displayLabel || parameters.length > 0;

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
  const labelOffset = (connectionType === 'request' || connectionType === 'response') ? offset : 0;

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
          strokeDasharray: connectionType === 'response' ? '5,5' : undefined,
        }}
      />
      {shouldShowLabel && (
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
              className={`px-3 py-2 ${colors.bg} border-2 ${
                selected ? colors.selectedBorder : colors.border
              } rounded-lg shadow-md text-xs font-medium ${colors.text}`}
            >
              {/* Connection Type Label */}
              {displayLabel && (
                <div className="flex items-center gap-1 font-semibold mb-1">
                  {directionType === 'request-response' && (
                    <span className="text-base">
                      {connectionType === 'request' ? '→' : '←'}
                    </span>
                  )}
                  {directionType === 'bidirectional' && (
                    <span className="text-base">↔</span>
                  )}
                  {connectionType === 'request' && directionType === 'unidirectional' && (
                    <span className="text-base">→</span>
                  )}
                  {connectionType === 'response' && directionType === 'unidirectional' && (
                    <span className="text-base">←</span>
                  )}
                  <span>{displayLabel}</span>
                </div>
              )}

              {/* Parameters */}
              {parameters.length > 0 && (
                <div className={displayLabel ? "mt-1.5 pt-1.5 border-t border-current border-opacity-20" : ""}>
                  <div className="text-[10px] opacity-60 mb-0.5 uppercase tracking-wide">
                    Parameters
                  </div>
                  <div className="font-mono text-xs opacity-90 leading-relaxed">
                    {parameters.map((param, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="opacity-50">•</span>
                        <span className="font-semibold">{param}</span>
                      </div>
                    ))}
                  </div>
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
