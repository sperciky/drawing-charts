/**
 * HTML Exporter - Creates standalone, shareable HTML files with embedded React Flow viewer
 */

export const exportToHTML = (nodes, edges, diagramTitle = 'Diagram') => {
  console.log('🚀 [HTML Export] Starting export process...');
  console.log('📊 [HTML Export] Input:', {
    nodeCount: nodes?.length || 0,
    edgeCount: edges?.length || 0,
    diagramTitle,
    nodesType: typeof nodes,
    edgesType: typeof edges,
    nodesIsArray: Array.isArray(nodes),
    edgesIsArray: Array.isArray(edges)
  });

  try {
    // Validate inputs
    if (!nodes) {
      const error = 'Nodes parameter is missing or undefined';
      console.error('❌ [HTML Export]', error, { nodes });
      throw new Error(error);
    }
    if (!edges) {
      const error = 'Edges parameter is missing or undefined';
      console.error('❌ [HTML Export]', error, { edges });
      throw new Error(error);
    }
    if (!Array.isArray(nodes)) {
      const error = `Nodes must be an array, got ${typeof nodes}`;
      console.error('❌ [HTML Export]', error);
      throw new Error(error);
    }
    if (!Array.isArray(edges)) {
      const error = `Edges must be an array, got ${typeof edges}`;
      console.error('❌ [HTML Export]', error);
      throw new Error(error);
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${diagramTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${timestamp}.html`;
    console.log('📝 [HTML Export] Generated filename:', filename);

    // Serialize the diagram data - export COMPLETE data structure
    console.log('🔄 [HTML Export] Serializing diagram data (full export)...');
    let diagramData;
    try {
      // Export the complete nodes and edges as-is, preserving all data
      // This ensures colors, labels, parameters, and all custom data are preserved
      diagramData = {
        nodes: nodes.map((node, index) => {
          if (!node) {
            throw new Error(`Node at index ${index} is null or undefined`);
          }
          if (!node.id) {
            throw new Error(`Node at index ${index} is missing id`);
          }
          // Return the complete node object with all its data
          return {
            ...node,
            // Ensure essential fields have defaults
            type: node.type || 'platform',
            position: node.position || { x: 0, y: 0 },
            data: node.data || {},
          };
        }),
        edges: edges.map((edge, index) => {
          if (!edge) {
            throw new Error(`Edge at index ${index} is null or undefined`);
          }
          if (!edge.id) {
            throw new Error(`Edge at index ${index} is missing id`);
          }
          // Return the complete edge object with all its data
          return {
            ...edge,
            // Ensure essential fields have defaults
            type: edge.type || 'custom',
            data: edge.data || {},
          };
        }),
      };
    } catch (serializationError) {
      console.error('❌ [HTML Export] Error during serialization:', serializationError);
      console.error('❌ [HTML Export] Sample node:', nodes[0]);
      console.error('❌ [HTML Export] Sample edge:', edges[0]);
      throw new Error(`Failed to serialize diagram data: ${serializationError.message}`);
    }
    console.log('✅ [HTML Export] Data serialized successfully:', {
      nodes: diagramData.nodes.length,
      edges: diagramData.edges.length
    });

    // Generate the HTML content
    console.log('🏗️ [HTML Export] Generating HTML template...');
    let htmlContent;
    try {
      htmlContent = generateHTMLTemplate(diagramData, diagramTitle, timestamp);
      if (!htmlContent || typeof htmlContent !== 'string') {
        throw new Error('HTML template generation returned invalid content');
      }
      console.log('✅ [HTML Export] HTML template generated, size:', htmlContent.length, 'bytes');
    } catch (templateError) {
      console.error('❌ [HTML Export] Error generating template:', templateError);
      throw new Error(`Failed to generate HTML template: ${templateError.message}`);
    }

    // Create and download the file
    console.log('💾 [HTML Export] Initiating download...');
    try {
      downloadFile(htmlContent, filename);
      console.log('✅ [HTML Export] Download initiated successfully');
    } catch (downloadError) {
      console.error('❌ [HTML Export] Error during download:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    return filename;
  } catch (error) {
    console.error('❌ [HTML Export] Export failed:', error);
    console.error('❌ [HTML Export] Error type:', error.constructor.name);
    console.error('❌ [HTML Export] Error message:', error.message);
    console.error('❌ [HTML Export] Error stack:', error.stack);
    // Re-throw with more context
    throw new Error(`HTML Export Failed: ${error.message}`);
  }
};

const generateHTMLTemplate = (diagramData, title, timestamp) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Diagram Viewer</title>

  <!-- React and ReactDOM from CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

  <!-- React Flow from CDN -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reactflow@11.10.4/dist/style.css">
  <script src="https://cdn.jsdelivr.net/npm/reactflow@11.10.4/dist/umd/index.min.js"></script>

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    #root {
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      z-index: 10;
    }

    .header h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .header p {
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .viewer-container {
      flex: 1;
      position: relative;
      background: #f9fafb;
    }

    .react-flow__node {
      font-family: inherit;
    }

    .custom-node {
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      min-width: 250px;
      min-height: 150px;
      cursor: default;
    }

    .custom-node-header {
      padding: 12px 16px;
      border-radius: 8px 8px 0 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .custom-node-header-icon {
      width: 20px;
      height: 20px;
      color: white;
      flex-shrink: 0;
    }

    .custom-node-header-title {
      color: white;
      font-weight: 600;
      font-size: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .custom-node-attributes {
      padding: 12px 16px;
    }

    .custom-node-attribute {
      display: flex;
      align-items: start;
      gap: 8px;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .custom-node-attribute-key {
      font-weight: 500;
      color: #374151;
      flex-shrink: 0;
    }

    .custom-node-attribute-value {
      color: #6b7280;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .custom-node-empty {
      padding: 24px 16px;
      text-align: center;
      color: #9ca3af;
      font-size: 14px;
    }

    .react-flow__edge-path {
      stroke-width: 2px;
    }

    .react-flow__edge.selected .react-flow__edge-path {
      stroke-width: 3px;
    }

    .edge-label {
      background: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .watermark {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background: rgba(255, 255, 255, 0.95);
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.75rem;
      color: #6b7280;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      z-index: 5;
      pointer-events: none;
    }

    .react-flow__controls {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .react-flow__attribution {
      display: none;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script>
    // Embedded diagram data
    const DIAGRAM_DATA = ${JSON.stringify(diagramData, null, 2)};
    const DIAGRAM_TITLE = ${JSON.stringify(title)};
    const EXPORT_DATE = ${JSON.stringify(timestamp)};

    // React Flow viewer component
    const { ReactFlow, Background, Controls, MiniMap } = window.ReactFlow;
    const { useState, useCallback } = React;

    // Custom Node Component - matches PlatformNode
    const CustomNode = ({ data }) => {
      const { Handle } = window.ReactFlow;
      const name = data.name || data.label || 'Untitled';
      const color = data.color || '#6b7280';
      const attributes = data.attributes || [];

      const children = [];

      // Add all connection handles (required for edges to render!)
      // Top handles
      children.push(
        React.createElement(Handle, {
          key: 'top-target',
          type: 'target',
          position: 'top',
          id: 'top-target',
          style: { opacity: 0 }
        }),
        React.createElement(Handle, {
          key: 'top-source',
          type: 'source',
          position: 'top',
          id: 'top-source',
          style: { opacity: 0 }
        })
      );

      // Bottom handles
      children.push(
        React.createElement(Handle, {
          key: 'bottom-target',
          type: 'target',
          position: 'bottom',
          id: 'bottom-target',
          style: { opacity: 0 }
        }),
        React.createElement(Handle, {
          key: 'bottom-source',
          type: 'source',
          position: 'bottom',
          id: 'bottom-source',
          style: { opacity: 0 }
        })
      );

      // Left handles
      children.push(
        React.createElement(Handle, {
          key: 'left-target',
          type: 'target',
          position: 'left',
          id: 'left-target',
          style: { opacity: 0 }
        }),
        React.createElement(Handle, {
          key: 'left-source',
          type: 'source',
          position: 'left',
          id: 'left-source',
          style: { opacity: 0 }
        })
      );

      // Right handles
      children.push(
        React.createElement(Handle, {
          key: 'right-target',
          type: 'target',
          position: 'right',
          id: 'right-target',
          style: { opacity: 0 }
        }),
        React.createElement(Handle, {
          key: 'right-source',
          type: 'source',
          position: 'right',
          id: 'right-source',
          style: { opacity: 0 }
        })
      );

      // Header with colored background
      children.push(
        React.createElement('div', {
          className: 'custom-node-header',
          style: { backgroundColor: color },
          key: 'header'
        }, [
          // Box icon (simple square)
          React.createElement('svg', {
            key: 'icon',
            className: 'custom-node-header-icon',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: '2'
          }, [
            React.createElement('rect', {
              key: 'rect',
              x: '3',
              y: '3',
              width: '18',
              height: '18',
              rx: '2',
              ry: '2'
            })
          ]),
          // Title
          React.createElement('h3', {
            key: 'title',
            className: 'custom-node-header-title'
          }, name)
        ])
      );

      // Attributes
      if (attributes.length > 0) {
        children.push(
          React.createElement('div', {
            className: 'custom-node-attributes',
            key: 'attributes'
          }, attributes.map((attr, index) =>
            React.createElement('div', {
              className: 'custom-node-attribute',
              key: attr.id || index
            }, [
              React.createElement('span', {
                className: 'custom-node-attribute-key',
                key: 'key'
              }, attr.key + ':'),
              React.createElement('span', {
                className: 'custom-node-attribute-value',
                key: 'value'
              }, attr.value)
            ])
          ))
        );
      } else {
        children.push(
          React.createElement('div', {
            className: 'custom-node-empty',
            key: 'empty'
          }, 'No attributes')
        );
      }

      return React.createElement('div', {
        className: 'custom-node'
      }, children);
    };

    // Custom Edge Component
    // Ultra simple test - just return a red line
    const TestEdge = (props) => {
      console.log('🟢 TEST EDGE CALLED!!!', props);

      const { id, sourceX, sourceY, targetX, targetY } = props;

      console.log('🟢 Edge positions:', { sourceX, sourceY, targetX, targetY });

      // Return a simple SVG path
      return React.createElement('path', {
        id: id,
        d: 'M ' + sourceX + ' ' + sourceY + ' L ' + targetX + ' ' + targetY,
        stroke: 'red',
        strokeWidth: 10,
        fill: 'none',
        className: 'react-flow__edge-path'
      });
    };

    const CustomEdge = (props) => {
      console.log('🔵 CustomEdge called!', props);

      try {
        const {
          id,
          sourceX,
          sourceY,
          targetX,
          targetY,
          sourcePosition,
          targetPosition,
          data = {},
          label,
          markerEnd,
          style = {}
        } = props;

        console.log('🔵 Positions:', { sourceX, sourceY, targetX, targetY });

        const { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, getBezierPath, getStraightPath } = window.ReactFlow;

        const directionType = data.directionType || 'unidirectional';
        const edgeType = data.type || 'smoothstep';
        const edgeLabel = data.label || label || '';

        console.log('🔵 Edge config:', { directionType, edgeType, edgeLabel });

        // Get the path calculation function
        let getPath = getSmoothStepPath;
        if (edgeType === 'straight') {
          getPath = getStraightPath;
        } else if (edgeType === 'bezier') {
          getPath = getBezierPath;
        }

        if (directionType === 'bidirectional') {
          const offset = 15;
          const dx = targetX - sourceX;
          const dy = targetY - sourceY;
          const length = Math.sqrt(dx * dx + dy * dy);

          if (length === 0) {
            return null; // Prevent division by zero
          }

          const offsetX = (-dy / length) * offset;
          const offsetY = (dx / length) * offset;

          const [requestPath] = getPath({
            sourceX: sourceX + offsetX,
            sourceY: sourceY + offsetY,
            targetX: targetX + offsetX,
            targetY: targetY + offsetY,
            sourcePosition,
            targetPosition,
          });

          const [responsePath] = getPath({
            sourceX: targetX - offsetX,
            sourceY: targetY - offsetY,
            targetX: sourceX - offsetX,
            targetY: sourceY - offsetY,
            sourcePosition: targetPosition,
            targetPosition: sourcePosition,
          });

          const labelX = (sourceX + targetX) / 2;
          const labelY = (sourceY + targetY) / 2;

          return React.createElement('g', { className: 'react-flow__edge' }, [
            React.createElement('path', {
              key: 'request',
              id: id + '-request',
              d: requestPath,
              fill: 'none',
              stroke: '#3b82f6',
              strokeWidth: 2,
              markerEnd: 'url(#arrow-blue)',
              className: 'react-flow__edge-path'
            }),
            React.createElement('path', {
              key: 'response',
              id: id + '-response',
              d: responsePath,
              fill: 'none',
              stroke: '#10b981',
              strokeWidth: 2,
              strokeDasharray: '5,5',
              markerEnd: 'url(#arrow-green)',
              className: 'react-flow__edge-path'
            }),
            edgeLabel && React.createElement(EdgeLabelRenderer, { key: 'label' },
              React.createElement('div', {
                className: 'edge-label',
                style: {
                  position: 'absolute',
                  transform: 'translate(-50%, -50%) translate(' + labelX + 'px, ' + labelY + 'px)',
                  background: '#fff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  border: '1px solid #ccc',
                  pointerEvents: 'all',
                }
              }, edgeLabel)
            )
          ]);
        }

        // Unidirectional
        const [edgePath, labelX, labelY] = getPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
          sourcePosition,
          targetPosition,
        });

        console.log('🔵 Generated path:', edgePath, 'label position:', labelX, labelY);

        const result = React.createElement('g', { className: 'react-flow__edge' }, [
          React.createElement('path', {
            key: 'path',
            id: id,
            d: edgePath,
            fill: 'none',
            stroke: '#6b7280',
            strokeWidth: 2,
            markerEnd: 'url(#arrow-gray)',
            className: 'react-flow__edge-path',
            ...style
          }),
          edgeLabel && React.createElement(EdgeLabelRenderer, { key: 'label' },
            React.createElement('div', {
              className: 'edge-label',
              style: {
                position: 'absolute',
                transform: 'translate(-50%, -50%) translate(' + labelX + 'px, ' + labelY + 'px)',
                background: '#fff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                border: '1px solid #ccc',
                pointerEvents: 'all',
              }
            }, edgeLabel)
          )
        ]);

        console.log('🔵 Returning edge element:', result);
        return result;
      } catch (error) {
        console.error('❌ CustomEdge error:', error, error.stack);
        return null;
      }
    };

    // Main Viewer Component
    const DiagramViewer = () => {
      const [nodes, setNodes] = useState(DIAGRAM_DATA.nodes);
      const [edges, setEdges] = useState(DIAGRAM_DATA.edges);

      // Debug logging
      console.log('📊 [Diagram Viewer] Initializing...', {
        nodeCount: nodes?.length || 0,
        edgeCount: edges?.length || 0,
        sampleNode: nodes?.[0],
        sampleEdge: edges?.[0]
      });

      const nodeTypes = {
        platform: CustomNode,
        custom: CustomNode,
      };

      const edgeTypes = {
        custom: TestEdge,  // Using simple test edge first
        test: TestEdge,
      };

      console.log('🔧 [Diagram Viewer] Types registered:', {
        nodeTypes: Object.keys(nodeTypes),
        edgeTypes: Object.keys(edgeTypes),
        CustomEdge: typeof CustomEdge,
        CustomEdgeIsFunction: typeof CustomEdge === 'function'
      });

      return React.createElement('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' } }, [
        React.createElement('div', { className: 'header', key: 'header' }, [
          React.createElement('h1', { key: 'title' }, DIAGRAM_TITLE),
          React.createElement('p', { key: 'subtitle' }, 'Read-only diagram viewer • Exported on ' + EXPORT_DATE)
        ]),
        React.createElement('div', { className: 'viewer-container', key: 'viewer' },
          React.createElement(ReactFlow, {
            nodes: nodes,
            edges: edges,
            nodeTypes: nodeTypes,
            edgeTypes: edgeTypes,
            fitView: true,
            nodesDraggable: false,
            nodesConnectable: false,
            elementsSelectable: true,
            nodesFocusable: false,
            edgesFocusable: false,
            panOnDrag: true,
            zoomOnScroll: true,
            defaultEdgeOptions: {
              type: 'custom',
              animated: false,
            },
            onError: (code, message) => {
              console.error('❌ ReactFlow Error Code:', code);
              console.error('❌ ReactFlow Error Message:', message);
              console.error('❌ Full error:', { code, message });
            },
            zoomOnPinch: true,
            zoomOnDoubleClick: true,
          }, [
            React.createElement('svg', {
              key: 'markers',
              style: { position: 'absolute', width: 0, height: 0 }
            },
              React.createElement('defs', null, [
                React.createElement('marker', {
                  key: 'blue',
                  id: 'arrow-blue',
                  viewBox: '0 0 20 20',
                  refX: '18',
                  refY: '10',
                  markerWidth: '20',
                  markerHeight: '20',
                  orient: 'auto'
                },
                  React.createElement('path', {
                    d: 'M 0 0 L 20 10 L 0 20 L 5 10 Z',
                    fill: '#3b82f6',
                    stroke: '#ffffff',
                    strokeWidth: '1'
                  })
                ),
                React.createElement('marker', {
                  key: 'green',
                  id: 'arrow-green',
                  viewBox: '0 0 20 20',
                  refX: '18',
                  refY: '10',
                  markerWidth: '20',
                  markerHeight: '20',
                  orient: 'auto'
                },
                  React.createElement('path', {
                    d: 'M 0 0 L 20 10 L 0 20 L 5 10 Z',
                    fill: '#10b981',
                    stroke: '#ffffff',
                    strokeWidth: '1'
                  })
                ),
                React.createElement('marker', {
                  key: 'gray',
                  id: 'arrow-gray',
                  viewBox: '0 0 20 20',
                  refX: '18',
                  refY: '10',
                  markerWidth: '20',
                  markerHeight: '20',
                  orient: 'auto'
                },
                  React.createElement('path', {
                    d: 'M 0 0 L 20 10 L 0 20 L 5 10 Z',
                    fill: '#6b7280',
                    stroke: '#ffffff',
                    strokeWidth: '1'
                  })
                )
              ])
            ),
            React.createElement(Background, {
              key: 'background',
              color: '#aaa',
              gap: 16
            }),
            React.createElement(Controls, {
              key: 'controls',
              showInteractive: false
            }),
            React.createElement(MiniMap, {
              key: 'minimap',
              nodeColor: (node) => node.data.color || '#6b7280',
              className: '!bg-white !border-gray-300',
              zoomable: true,
              pannable: true
            })
          ])
        ),
        React.createElement('div', { className: 'watermark', key: 'watermark' },
          '📊 Created with Diagram Editor'
        )
      ]);
    };

    // Render the app
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(DiagramViewer));
  </script>
</body>
</html>`;
};

const downloadFile = (content, filename) => {
  try {
    console.log('📦 [Download] Creating blob...');
    const blob = new Blob([content], { type: 'text/html' });
    console.log('✅ [Download] Blob created, size:', blob.size, 'bytes');

    console.log('🔗 [Download] Creating object URL...');
    const url = URL.createObjectURL(blob);
    console.log('✅ [Download] Object URL created:', url);

    console.log('🔗 [Download] Creating download link...');
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    console.log('✅ [Download] Link configured:', { href: url, download: filename });

    console.log('📎 [Download] Appending link to document...');
    document.body.appendChild(link);

    console.log('🖱️ [Download] Triggering click...');
    link.click();
    console.log('✅ [Download] Click triggered');

    console.log('🧹 [Download] Cleaning up...');
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('✅ [Download] Cleanup complete');
  } catch (error) {
    console.error('❌ [Download] Download failed:', error);
    console.error('❌ [Download] Error details:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};
