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
  const getPath = (srcX, srcY, tgtX, tgtY) => {
    if (type === 'smoothstep') {
      return getSmoothStepPath({
        sourceX: srcX,
        sourceY: srcY,
        sourcePosition,
        targetX: tgtX,
        targetY: tgtY,
        targetPosition,
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
        sourcePosition,
        targetX: tgtX,
        targetY: tgtY,
        targetPosition,
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
      targetY + requestOffset.y
    );

    // Response line (green, dashed, arrow pointing FROM target TO source)
    // Draw in reverse direction so markerEnd points from target to source
    const [responsePath, responseLabelX, responseLabelY] = getPath(
      targetX + responseOffset.x,
      targetY + responseOffset.y,
      sourceX + responseOffset.x,
      sourceY + responseOffset.y
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

    const requestMarker = {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#3b82f6', // blue
    };

    const responseMarker = {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#10b981', // green
    };

    debugLog('🚀 About to render bidirectional components');

    return (
      <>
        {/* Request Line - Blue, Solid, Arrow to Target */}
        <BaseEdge
          path={requestPath}
          markerEnd={requestMarker}
          style={{
            ...style,
            strokeWidth: selected ? 3 : 2,
            stroke: '#3b82f6', // blue
          }}
        />

        {/* Response Line - Green, Dashed, Arrow FROM target TO source */}
        <BaseEdge
          path={responsePath}
          markerEnd={responseMarker}
          style={{
            ...style,
            strokeWidth: selected ? 3 : 2,
            stroke: '#10b981', // green
            strokeDasharray: '5,5',
          }}
        />

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
  const [edgePath, labelX, labelY] = getPath(sourceX, sourceY, targetX, targetY);

  const marker = {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#6b7280',
  };

  const hasParameters = requestParameters.length > 0 || responseParameters.length > 0;
  const showLabel = label || !hasParameters;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={marker}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: '#6b7280',
        }}
      />

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
