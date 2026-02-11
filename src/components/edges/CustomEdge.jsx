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
    requestLabel = 'request',
    responseLabel = 'response',
    requestParameters = [],
    responseParameters = []
  } = data || {};

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
    // Calculate offsets for parallel lines
    const requestOffset = calculateOffset(35); // 35px offset upward
    const responseOffset = calculateOffset(-35); // 35px offset downward

    // Request line (blue, solid, arrow pointing to target)
    const [requestPath, requestLabelX, requestLabelY] = getPath(
      sourceX + requestOffset.x,
      sourceY + requestOffset.y,
      targetX + requestOffset.x,
      targetY + requestOffset.y
    );

    // Response line (green, dashed, arrow pointing to source)
    const [responsePath, responseLabelX, responseLabelY] = getPath(
      sourceX + responseOffset.x,
      sourceY + responseOffset.y,
      targetX + responseOffset.x,
      targetY + responseOffset.y
    );

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

        {/* Response Line - Green, Dashed, Arrow to Source */}
        <BaseEdge
          path={responsePath}
          markerStart={responseMarker}
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
                transform: `translate(-50%, -50%) translate(${requestLabelX}px,${requestLabelY}px)`,
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
                transform: `translate(-50%, -50%) translate(${responseLabelX}px,${responseLabelY}px)`,
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
