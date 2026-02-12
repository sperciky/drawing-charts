/**
 * HTML Exporter - Creates standalone, shareable HTML files with embedded React Flow viewer
 */

export const exportToHTML = (nodes, edges, diagramTitle = 'Diagram') => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${diagramTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${timestamp}.html`;

  // Serialize the diagram data
  const diagramData = {
    nodes: nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        label: node.data.label,
        color: node.data.color,
        description: node.data.description,
      },
    })),
    edges: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      label: edge.label,
      data: edge.data,
    })),
  };

  // Generate the HTML content
  const htmlContent = generateHTMLTemplate(diagramData, diagramTitle, timestamp);

  // Create and download the file
  downloadFile(htmlContent, filename);

  return filename;
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
      padding: 12px 20px;
      border-radius: 8px;
      border: 2px solid;
      background: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      min-width: 150px;
      text-align: center;
      cursor: default;
    }

    .custom-node .label {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
      word-wrap: break-word;
    }

    .custom-node .description {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
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
    const { ReactFlow, Background, Controls, MiniMap } = ReactFlowRenderer;
    const { useState, useCallback } = React;

    // Custom Node Component
    const CustomNode = ({ data }) => {
      return React.createElement('div', {
        className: 'custom-node',
        style: {
          borderColor: data.color || '#6b7280',
          backgroundColor: 'white',
        }
      }, [
        React.createElement('div', { className: 'label', key: 'label' }, data.label),
        data.description && React.createElement('div', {
          className: 'description',
          key: 'description'
        }, data.description)
      ]);
    };

    // Custom Edge Component
    const CustomEdge = ({
      id,
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      data,
      label,
      markerEnd
    }) => {
      const { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } = ReactFlowRenderer;

      const directionType = data?.directionType || 'unidirectional';
      const edgeType = data?.type || 'smoothstep';

      // Get the path calculation function
      let getPath = getSmoothStepPath;
      if (edgeType === 'straight') {
        getPath = ReactFlowRenderer.getStraightPath;
      } else if (edgeType === 'step') {
        getPath = ReactFlowRenderer.getStepPath;
      } else if (edgeType === 'bezier') {
        getPath = ReactFlowRenderer.getBezierPath;
      }

      if (directionType === 'bidirectional') {
        const offset = 15;
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const length = Math.sqrt(dx * dx + dy * dy);
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

        return React.createElement(React.Fragment, null, [
          React.createElement('path', {
            key: 'request',
            d: requestPath,
            fill: 'none',
            stroke: '#3b82f6',
            strokeWidth: 2,
            markerEnd: 'url(#arrow-blue)',
            className: 'react-flow__edge-path'
          }),
          React.createElement('path', {
            key: 'response',
            d: responsePath,
            fill: 'none',
            stroke: '#10b981',
            strokeWidth: 2,
            strokeDasharray: '5,5',
            markerEnd: 'url(#arrow-green)',
            className: 'react-flow__edge-path'
          }),
          label && React.createElement(EdgeLabelRenderer, { key: 'label' },
            React.createElement('div', {
              className: 'edge-label',
              style: {
                position: 'absolute',
                transform: \`translate(-50%, -50%) translate(\${(sourceX + targetX) / 2}px, \${(sourceY + targetY) / 2}px)\`,
                pointerEvents: 'all',
              }
            }, label)
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

      return React.createElement(React.Fragment, null, [
        React.createElement('path', {
          key: 'path',
          d: edgePath,
          fill: 'none',
          stroke: '#6b7280',
          strokeWidth: 2,
          markerEnd: 'url(#arrow-gray)',
          className: 'react-flow__edge-path'
        }),
        label && React.createElement(EdgeLabelRenderer, { key: 'label' },
          React.createElement('div', {
            className: 'edge-label',
            style: {
              position: 'absolute',
              transform: \`translate(-50%, -50%) translate(\${labelX}px, \${labelY}px)\`,
              pointerEvents: 'all',
            }
          }, label)
        )
      ]);
    };

    // Main Viewer Component
    const DiagramViewer = () => {
      const [nodes, setNodes] = useState(DIAGRAM_DATA.nodes);
      const [edges, setEdges] = useState(DIAGRAM_DATA.edges);

      const nodeTypes = {
        custom: CustomNode,
      };

      const edgeTypes = {
        custom: CustomEdge,
      };

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
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
