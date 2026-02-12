import React, { useMemo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, getSmoothStepPath, getStraightPath, MarkerType } from 'reactflow';
import { adjustTwoLabels } from '../../hooks/useEdgeLabelCollision';
import { debugLog } from '../../utils/debug';

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
    requestLabel = 'request',
    responseLabel = 'response',
    requestParameters = [],
    responseParameters = []
  } = data || {};

  // DEBUG LOGGING
  debugLog('🔍 CustomEdge Render:', {
    edgeId: id,
    directionType,
    requestParameters,
    responseParameters,
    requestLabel,
    responseLabel,
    fullData: data,
  });

  // Calculate perpendicular offset for parallel lines
  const calculateOffset = (offsetAmount) => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) return { x: 0, y: 0 };

    // Perpendicular vector
    const perpX = -dy / length;
    const perpY = dx / length;

    return {
      x: perpX * offsetAmount,
      y: perpY * offsetAmount
    };
  };

  // Helper to get path based on type
  const getPath = (srcX, srcY, tgtX, tgtY, srcPos, tgtPos) => {
    if (type === 'smoothstep') {
      return getSmoothStepPath({
        sourceX: srcX,
        sourceY: srcY,
        sourcePosition: srcPos,
        targetX: tgtX,
        targetY: tgtY,
        targetPosition: tgtPos,
      });
    } else if (type === 'straight') {
      return getStraightPath({
        sourceX: srcX,
        sourceY: srcY,
        targetX: tgtX,
        targetY: tgtY,
      });
    } else {
      return getBezierPath({
        sourceX: srcX,
        sourceY: srcY,
        sourcePosition: srcPos,
        targetX: tgtX,
        targetY: tgtY,
        targetPosition: tgtPos,
      });
    }
  };

  // BIDIRECTIONAL: Render two separate parallel lines
  if (directionType === 'bidirectional') {
    debugLog('✅ BIDIRECTIONAL MODE ACTIVE for edge:', id);

    // Calculate offsets for parallel lines (reduced from 35 to 15 for tighter spacing)
    const requestOffset = calculateOffset(15); // 15px offset upward
    const responseOffset = calculateOffset(-15); // 15px offset downward

    // Request line (blue, solid, arrow pointing FROM source TO target)
    const [requestPath, requestLabelX, requestLabelY] = getPath(
      sourceX + requestOffset.x,
      sourceY + requestOffset.y,
      targetX + requestOffset.x,
      targetY + requestOffset.y,
      sourcePosition,
      targetPosition
    );

    // Response line (green, dashed, arrow pointing FROM target TO source)
    // Draw in reverse direction so markerEnd points from target to source
    // IMPORTANT: Swap positions because we're drawing in reverse!
    const [responsePath, responseLabelX, responseLabelY] = getPath(
      targetX + responseOffset.x,
      targetY + responseOffset.y,
      sourceX + responseOffset.x,
      sourceY + responseOffset.y,
      targetPosition,  // Use target position as source (reversed!)
      sourcePosition   // Use source position as target (reversed!)
    );

    debugLog('📍 Label Positions:', {
      requestLabelX,
      requestLabelY,
      responseLabelX,
      responseLabelY,
    });

    // Apply D3-force collision detection to prevent label overlap
    const adjustedPositions = useMemo(() => {
      if (requestParameters.length === 0 || responseParameters.length === 0) {
        // If only one has parameters, no collision possible
        return {
          label1: { x: requestLabelX, y: requestLabelY },
          label2: { x: responseLabelX, y: responseLabelY },
        };
      }

      // Both have parameters - check for collision (reduced force for tighter positioning)
      return adjustTwoLabels(
        { x: requestLabelX, y: requestLabelY, width: 140, height: 70 },
        { x: responseLabelX, y: responseLabelY, width: 140, height: 70 },
        { minDistance: 40, iterations: 30 }  // Reduced from 100/120 to 40/30
      );
    }, [requestLabelX, requestLabelY, responseLabelX, responseLabelY, requestParameters.length, responseParameters.length]);

    const finalRequestX = adjustedPositions.label1.x;
    const finalRequestY = adjustedPositions.label1.y;
    const finalResponseX = adjustedPositions.label2.x;
    const finalResponseY = adjustedPositions.label2.y;

    debugLog('🎯 Final Adjusted Positions:', {
      finalRequestX,
      finalRequestY,
      finalResponseX,
      finalResponseY,
    });

    debugLog('📦 Will Render Request Box?', requestParameters.length > 0);
    debugLog('📦 Will Render Response Box?', responseParameters.length > 0);

    debugLog('🚀 About to render bidirectional components');

    return (
      <>
        {/* Request Line - Blue, Solid, Arrow to Target */}
        <path
          d={requestPath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={selected ? 3 : 2}
          markerEnd="url(#arrow-blue)"
          className="react-flow__edge-path"
        />

        {/* Response Line - Green, Dashed, Arrow FROM target TO source */}
        <path
          d={responsePath}
          fill="none"
          stroke="#10b981"
          strokeWidth={selected ? 3 : 2}
          strokeDasharray="5,5"
          markerEnd="url(#arrow-green)"
          className="react-flow__edge-path"
        />

        {/* Reconnection handles for bidirectional edges - visual indicators only */}
        {selected && (
          <>
            {/* Source handle */}
            <EdgeLabelRenderer>
              <div
                style={{
                  position: 'absolute',
                  transform: `translate(-50%, -50%) translate(${sourceX}px,${sourceY}px)`,
                  pointerEvents: 'none',
                  zIndex: 1000,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full bg-purple-500 border-[4px] border-white shadow-lg animate-pulse"
                  style={{
                    boxShadow: '0 0 0 3px rgba(168, 85, 247, 0.6), 0 4px 12px -2px rgba(0, 0, 0, 0.3)',
                    opacity: 0.9,
                  }}
                />
              </div>
            </EdgeLabelRenderer>

            {/* Target handle */}
            <EdgeLabelRenderer>
              <div
                style={{
                  position: 'absolute',
                  transform: `translate(-50%, -50%) translate(${targetX}px,${targetY}px)`,
                  pointerEvents: 'none',
                  zIndex: 1000,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full bg-blue-500 border-[4px] border-white shadow-lg animate-pulse"
                  style={{
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.6), 0 4px 12px -2px rgba(0, 0, 0, 0.3)',
                    opacity: 0.9,
                  }}
                />
              </div>
            </EdgeLabelRenderer>
          </>
        )}

        {/* Request Parameters Box - Always show if we have parameters */}
        {requestParameters.length > 0 && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${finalRequestX}px,${finalRequestY}px)`,
                pointerEvents: 'all',
              }}
              className="nodrag nopan"
            >
              <div
                className={`px-3 py-2 bg-blue-50 border-2 ${
                  selected ? 'border-blue-500' : 'border-blue-300'
                } rounded-lg shadow-md text-xs font-medium text-blue-900`}
              >
                {/* Request Label */}
                <div className="flex items-center gap-1 font-semibold mb-1">
                  <span className="text-base">→</span>
                  <span>{requestLabel}</span>
                </div>

                {/* Request Parameters */}
                <div className="mt-1.5 pt-1.5 border-t border-current border-opacity-20">
                  <div className="text-[10px] opacity-60 mb-0.5 uppercase tracking-wide">
                    Parameters
                  </div>
                  <div className="font-mono text-xs opacity-90 leading-relaxed">
                    {requestParameters.map((param, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="opacity-50">•</span>
                        <span className="font-semibold">{param}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </EdgeLabelRenderer>
        )}

        {/* Response Parameters Box - Always show if we have parameters */}
        {responseParameters.length > 0 && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${finalResponseX}px,${finalResponseY}px)`,
                pointerEvents: 'all',
              }}
              className="nodrag nopan"
            >
              <div
                className={`px-3 py-2 bg-green-50 border-2 ${
                  selected ? 'border-green-500' : 'border-green-300'
                } rounded-lg shadow-md text-xs font-medium text-green-900`}
              >
                {/* Response Label */}
                <div className="flex items-center gap-1 font-semibold mb-1">
                  <span className="text-base">←</span>
                  <span>{responseLabel}</span>
                </div>

                {/* Response Parameters */}
                <div className="mt-1.5 pt-1.5 border-t border-current border-opacity-20">
                  <div className="text-[10px] opacity-60 mb-0.5 uppercase tracking-wide">
                    Parameters
                  </div>
                  <div className="font-mono text-xs opacity-90 leading-relaxed">
                    {responseParameters.map((param, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="opacity-50">•</span>
                        <span className="font-semibold">{param}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }

  // UNIDIRECTIONAL: Single line with one arrow, but can still show parameter boxes
  const [edgePath, labelX, labelY] = getPath(sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition);

  const hasParameters = requestParameters.length > 0 || responseParameters.length > 0;
  const showLabel = label || !hasParameters;

  // Render reconnection handles when selected
  const renderReconnectionHandles = () => {
    if (!selected) return null;

    return (
      <>
        {/* Target handle - visual indicator only, doesn't block pointer events */}
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${targetX}px,${targetY}px)`,
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          >
            <div
              className="w-10 h-10 rounded-full bg-blue-500 border-[4px] border-white shadow-lg animate-pulse"
              style={{
                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.6), 0 4px 12px -2px rgba(0, 0, 0, 0.3)',
                opacity: 0.9,
              }}
            />
          </div>
        </EdgeLabelRenderer>
      </>
    );
  };

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        stroke="#6b7280"
        strokeWidth={selected ? 3 : 2}
        markerEnd="url(#arrow-gray)"
        className="react-flow__edge-path"
      />

      {/* Reconnection handles */}
      {renderReconnectionHandles()}

      {/* Show label if provided OR if no parameters */}
      {showLabel && label && (
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
              className={`px-3 py-2 bg-gray-50 border-2 ${
                selected ? 'border-gray-500' : 'border-gray-300'
              } rounded-lg shadow-md text-xs font-medium text-gray-900`}
            >
              <span>{label}</span>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Show parameter boxes for unidirectional too */}
      {requestParameters.length > 0 && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY - 30}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div
              className={`px-3 py-2 bg-blue-50 border-2 ${
                selected ? 'border-blue-500' : 'border-blue-300'
              } rounded-lg shadow-md text-xs font-medium text-blue-900`}
            >
              <div className="flex items-center gap-1 font-semibold mb-1">
                <span className="text-base">→</span>
                <span>{requestLabel}</span>
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-current border-opacity-20">
                <div className="text-[10px] opacity-60 mb-0.5 uppercase tracking-wide">
                  Parameters
                </div>
                <div className="font-mono text-xs opacity-90 leading-relaxed">
                  {requestParameters.map((param, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="opacity-50">•</span>
                      <span className="font-semibold">{param}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}

      {responseParameters.length > 0 && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY + 30}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div
              className={`px-3 py-2 bg-green-50 border-2 ${
                selected ? 'border-green-500' : 'border-green-300'
              } rounded-lg shadow-md text-xs font-medium text-green-900`}
            >
              <div className="flex items-center gap-1 font-semibold mb-1">
                <span className="text-base">←</span>
                <span>{responseLabel}</span>
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-current border-opacity-20">
                <div className="text-[10px] opacity-60 mb-0.5 uppercase tracking-wide">
                  Parameters
                </div>
                <div className="font-mono text-xs opacity-90 leading-relaxed">
                  {responseParameters.map((param, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="opacity-50">•</span>
                      <span className="font-semibold">{param}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;
