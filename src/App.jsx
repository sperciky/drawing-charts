import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Components
import PlatformNode from './components/nodes/PlatformNode';
import CustomEdge from './components/edges/CustomEdge';
import Sidebar from './components/panels/Sidebar';
import Toolbar from './components/panels/Toolbar';
import NodeEditor from './components/panels/NodeEditor';
import EdgeEditor from './components/panels/EdgeEditor';

// Hooks
import { useHistory } from './hooks/useHistory';
import { useCollision } from './hooks/useCollision';
import { useAutoLayout } from './hooks/useAutoLayout';
import { useFileOperations } from './hooks/useFileOperations';
import { useExport } from './hooks/useExport';

// Utils
import { electronAPI } from './utils/ipc';
import { generateNodeId, generateId } from './utils/helpers';
import { DEFAULT_NODE_COLOR } from './constants/colors';
import { setDebugMode } from './utils/debug';

const nodeTypes = {
  platform: PlatformNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

function App() {
  const reactFlowWrapper = useRef(null);
  const reactFlowRef = useRef(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [debugModeState, setDebugModeState] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [reconnectMode, setReconnectMode] = useState(null); // { edgeId, endpoint: 'source' | 'target', selectedHandle: 'top' | 'right' | 'bottom' | 'left' }

  // Reconnection mode handlers (defined early for use in other callbacks)
  const handleStartReconnection = useCallback((edgeId, endpoint, selectedHandle = null) => {
    setReconnectMode({ edgeId, endpoint, selectedHandle });
    if (selectedHandle) {
      console.log(`🔄 Reconnection mode: ${endpoint} of edge ${edgeId}, handle: ${selectedHandle.toUpperCase()}`);
      console.log('👆 Click on a node to complete reconnection');
    } else {
      console.log(`🔄 Reconnection mode started: ${endpoint} of edge ${edgeId}`);
      console.log('👆 Choose a handle position first');
    }
  }, []);

  const handleCancelReconnection = useCallback(() => {
    setReconnectMode(null);
    console.log('❌ Reconnection mode cancelled');
  }, []);

  // Handle debug mode toggle
  const handleDebugModeToggle = useCallback((enabled) => {
    setDebugModeState(enabled);
    setDebugMode(enabled); // Update global debug flag
  }, []);

  // Hooks
  const { pushState, undo, redo, canUndo, canRedo, reset } = useHistory({
    nodes: [],
    edges: [],
  });
  const { checkAndResolveCollision } = useCollision();
  const { applyAutoLayout } = useAutoLayout();
  const {
    saveFile,
    saveFileAs,
    openFile,
    exportFile,
    newFile,
    currentFilePath,
    diagramName,
  } = useFileOperations();
  const { exportImage } = useExport(reactFlowRef);

  // Fix any broken edges on mount (edges with invalid handle types)
  useEffect(() => {
    // Check for edges with invalid handle configurations
    const brokenEdges = edges.filter((edge) => {
      // An edge is broken if:
      // - sourceHandle ends with '-target' (should be '-source')
      // - targetHandle ends with '-source' (should be '-target')
      const hasInvalidSourceHandle = edge.sourceHandle?.endsWith('-target');
      const hasInvalidTargetHandle = edge.targetHandle?.endsWith('-source');
      return hasInvalidSourceHandle || hasInvalidTargetHandle;
    });

    if (brokenEdges.length > 0) {
      console.warn('⚠️ Found broken edges with invalid handles:', brokenEdges);
      console.warn('⚠️ Removing broken edges...');

      // Remove broken edges
      const brokenEdgeIds = brokenEdges.map((e) => e.id);
      setEdges((eds) => eds.filter((e) => !brokenEdgeIds.includes(e.id)));

      console.log('✅ Broken edges removed. You may need to recreate these connections.');
    }
  }, []); // Run only once on mount

  // Save state to history on changes
  useEffect(() => {
    pushState({ nodes, edges });
  }, [nodes, edges]);

  // Handle node click
  const onNodeClick = useCallback((event, clickedNode) => {
    // If in reconnection mode, reconnect the edge
    if (reconnectMode) {
      const { edgeId, endpoint } = reconnectMode;

      console.log(`🔄 Reconnecting ${endpoint} to node:`, clickedNode.id, clickedNode.data.name);

      // Find the edge being reconnected
      const targetEdge = edges.find(e => e.id === edgeId);
      if (!targetEdge) {
        console.error('❌ Edge not found:', edgeId);
        setReconnectMode(null);
        return;
      }

      // Use explicit handle selection instead of coordinate detection
      const { selectedHandle } = reconnectMode;

      // Check if user has selected a handle yet
      if (!selectedHandle) {
        console.log('⚠️ No handle selected yet. Please choose a handle position (Top/Right/Bottom/Left) first.');
        return;
      }

      // Construct handle name based on endpoint type
      const handleType = endpoint === 'source' ? '-source' : '-target';
      const newHandle = selectedHandle + handleType;

      console.log(`✅ User selected handle: ${selectedHandle.toUpperCase()}, constructing: ${newHandle}`);

      if (endpoint === 'source') {
        console.log(`✅ Setting source: ${clickedNode.id}, handle: ${newHandle}`);
        setEdges((eds) =>
          eds.map((edge) =>
            edge.id === edgeId
              ? { ...edge, source: clickedNode.id, sourceHandle: newHandle }
              : edge
          )
        );
      } else {
        console.log(`✅ Setting target: ${clickedNode.id}, handle: ${newHandle}`);
        setEdges((eds) =>
          eds.map((edge) =>
            edge.id === edgeId
              ? { ...edge, target: clickedNode.id, targetHandle: newHandle }
              : edge
          )
        );
      }

      setReconnectMode(null);
      console.log(`✅ Edge ${edgeId} reconnected: ${endpoint} → ${clickedNode.id} (${clickedNode.data.name}) at ${selectedHandle.toUpperCase()}`);
      return;
    }

    setSelectedNode(clickedNode);
    setSelectedEdge(null);
  }, [reconnectMode, setEdges, nodes, edges, reactFlowWrapper]);

  // Handle edge click
  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    // Cancel reconnection mode if active
    if (reconnectMode) {
      handleCancelReconnection();
      return;
    }

    setSelectedNode(null);
    setSelectedEdge(null);
  }, [reconnectMode, handleCancelReconnection]);

  // Handle connection
  const onConnect = useCallback(
    (params) => {
      // Generate unique ID that includes timestamp to allow multiple connections
      const timestamp = Date.now();
      const newEdge = {
        ...params,
        id: `e${params.source}-${params.target}-${timestamp}`,
        type: 'custom',
        animated: false,
        label: '',
        reconnectable: 'target', // For unidirectional edges, only target end is reconnectable
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        data: {
          label: '',
          type: 'smoothstep',
          directionType: 'unidirectional', // unidirectional or bidirectional
          connectionType: 'none', // none, request, or response (for color coding and offset)
          parameters: [], // Array of parameter names
        },
      };
      // Directly add to edges instead of using addEdge to avoid duplicate prevention
      setEdges((eds) => [...eds, newEdge]);
    },
    [setEdges]
  );

  // Handle node drag stop (collision detection)
  const onNodeDragStop = useCallback(
    (event, node) => {
      const newPosition = checkAndResolveCollision(node, nodes);
      setNodes((nds) =>
        nds.map((n) => (n.id === node.id ? { ...n, position: newPosition } : n))
      );
    },
    [nodes, checkAndResolveCollision, setNodes]
  );

  // Add new node
  const handleAddNode = useCallback(() => {
    const newId = generateNodeId(nodes);
    const newNode = {
      id: newId,
      type: 'platform',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        name: `Platform ${newId}`,
        color: DEFAULT_NODE_COLOR,
        attributes: [],
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes]);

  // Update node
  const handleUpdateNode = useCallback(
    (nodeId, data) => {
      setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, data } : n)));
    },
    [setNodes]
  );

  // Delete node
  const handleDeleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  // Update edge
  const handleUpdateEdge = useCallback(
    (edgeId, updatedEdge) => {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === edgeId) {
            const updated = {
              ...e,
              ...updatedEdge,
              data: { ...e.data, ...updatedEdge.data },
            };
            // Set reconnectable based on direction type
            const directionType = updated.data?.directionType || 'unidirectional';
            updated.reconnectable = directionType === 'unidirectional' ? 'target' : true;
            return updated;
          }
          return e;
        })
      );
    },
    [setEdges]
  );

  // Helper to convert handle type when reversing
  // Converts "left-source" to "left-target" and vice versa
  const convertHandleType = (handleId) => {
    if (!handleId) {
      console.log('⚠️ convertHandleType: handleId is null/undefined');
      return handleId;
    }

    let result;
    if (handleId.endsWith('-source')) {
      result = handleId.replace('-source', '-target');
    } else if (handleId.endsWith('-target')) {
      result = handleId.replace('-target', '-source');
    } else {
      result = handleId;
    }

    console.log(`🔄 convertHandleType: "${handleId}" → "${result}"`);
    return result;
  };

  // Reverse edge direction (swap source and target)
  const handleReverseEdge = useCallback(
    (edgeId) => {
      let reversedEdge = null;

      setEdges((eds) =>
        eds.map((e) => {
          if (e.id !== edgeId) return e;

          console.log('🔄 Reversing edge:', {
            oldSource: e.source,
            oldTarget: e.target,
            oldSourceHandle: e.sourceHandle,
            oldTargetHandle: e.targetHandle,
          });

          // When reversing an edge, we need to:
          // 1. Swap source and target nodes
          // 2. The new sourceHandle should use the position from the old targetHandle but with type=source
          // 3. The new targetHandle should use the position from the old sourceHandle but with type=target
          const newSourceHandle = convertHandleType(e.targetHandle);
          const newTargetHandle = convertHandleType(e.sourceHandle);

          console.log('🔄 New handles:', {
            newSource: e.target,
            newTarget: e.source,
            newSourceHandle,
            newTargetHandle,
          });

          // Create reversed edge with only the properties we explicitly want to keep
          // This avoids carrying over internal ReactFlow properties that might become invalid
          const directionType = e.data?.directionType || 'unidirectional';
          const reversed = {
            id: e.id,
            type: e.type,
            source: e.target,
            target: e.source,
            sourceHandle: newSourceHandle,
            targetHandle: newTargetHandle,
            animated: e.animated,
            label: e.label,
            style: e.style,
            reconnectable: directionType === 'unidirectional' ? 'target' : true,
            markerEnd: e.markerEnd,
            markerStart: e.markerStart,
            data: { ...e.data },
          };

          // Swap request/response parameters and labels
          // (applies to both unidirectional and bidirectional)
          reversed.data = {
            ...e.data,
            requestLabel: e.data?.responseLabel || 'response',
            responseLabel: e.data?.requestLabel || 'request',
            requestParameters: e.data?.responseParameters || [],
            responseParameters: e.data?.requestParameters || [],
          };

          console.log('✅ Reversed edge created:', reversed);

          reversedEdge = reversed;
          return reversed;
        })
      );

      // Update selectedEdge to show the new edge data in EdgeEditor
      if (reversedEdge && selectedEdge?.id === edgeId) {
        setSelectedEdge(reversedEdge);
      }
    },
    [setEdges, selectedEdge]
  );

  // Validate connections to ensure proper handle types
  const isValidConnection = useCallback((connection) => {
    // Must have both source and target
    if (!connection.source || !connection.target) {
      console.log('❌ Invalid connection: missing source or target');
      return false;
    }

    // Check handle types
    const sourceHandle = connection.sourceHandle || '';
    const targetHandle = connection.targetHandle || '';

    // Source handle must be a "source" type, target handle must be a "target" type
    const sourceIsValid = sourceHandle.endsWith('-source');
    const targetIsValid = targetHandle.endsWith('-target');

    if (!sourceIsValid || !targetIsValid) {
      console.log('❌ Invalid connection: wrong handle types', {
        sourceHandle,
        targetHandle,
        sourceIsValid,
        targetIsValid,
      });
      return false;
    }

    console.log('✅ Valid connection:', {
      source: connection.source,
      target: connection.target,
      sourceHandle,
      targetHandle,
    });

    return true;
  }, []);

  // Drag-to-reconnect disabled (edgeUpdaterRadius={0})
  // Users can reconnect edges using the button-based approach in EdgeEditor
  // which provides explicit control and avoids handle type confusion

  // Delete edge
  const handleDeleteEdge = useCallback(
    (edgeId) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    },
    [setEdges]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if user is typing in an input field
      const isTyping =
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable;

      // Delete key - only if NOT typing in an input field
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (!isTyping) {
          if (selectedNode) {
            event.preventDefault();
            handleDeleteNode(selectedNode.id);
            setSelectedNode(null);
          } else if (selectedEdge) {
            event.preventDefault();
            handleDeleteEdge(selectedEdge.id);
            setSelectedEdge(null);
          }
        }
      }

      // Undo/Redo - only when NOT typing in input fields
      if (!isTyping && (event.ctrlKey || event.metaKey)) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          handleUndo();
        } else if ((event.key === 'z' && event.shiftKey) || event.key === 'y') {
          event.preventDefault();
          handleRedo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedEdge]);

  // Undo
  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState) {
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
    }
  }, [undo, setNodes, setEdges]);

  // Redo
  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
    }
  }, [redo, setNodes, setEdges]);

  // Auto layout
  const handleAutoLayout = useCallback(
    (direction = 'TB') => {
      const layoutedNodes = applyAutoLayout(nodes, edges, direction);
      setNodes(layoutedNodes);
    },
    [nodes, edges, applyAutoLayout, setNodes]
  );

  // New diagram
  const handleNew = useCallback(async () => {
    if (nodes.length > 0 || edges.length > 0) {
      const confirmed = await electronAPI.showConfirm(
        'New Diagram',
        'Are you sure? Any unsaved changes will be lost.'
      );
      if (!confirmed.confirmed) return;
    }

    // Start with completely empty board
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setSelectedEdge(null);
    reset({ nodes: [], edges: [] });
    newFile();
  }, [nodes, edges, setNodes, setEdges, reset, newFile]);

  // Open diagram
  const handleOpen = useCallback(async () => {
    const result = await openFile();
    if (result.success) {
      setNodes(result.nodes);
      setEdges(result.edges);
      setSelectedNode(null);
      setSelectedEdge(null);
      reset({ nodes: result.nodes, edges: result.edges });
    }
  }, [openFile, setNodes, setEdges, reset]);

  // Save diagram
  const handleSave = useCallback(async () => {
    if (currentFilePath) {
      await saveFile(nodes, edges);
    } else {
      await saveFileAs(nodes, edges);
    }
  }, [nodes, edges, currentFilePath, saveFile, saveFileAs]);

  // Export
  const handleExport = useCallback(
    async (format) => {
      if (['png', 'jpg', 'svg', 'pdf'].includes(format)) {
        const result = await exportImage(format);
        if (result.success) {
          await electronAPI.showMessage('Export Successful', `Diagram exported as ${format.toUpperCase()}`);
        } else {
          await electronAPI.showMessage('Export Failed', result.error || 'Unknown error', 'error');
        }
      } else if (format === 'xml') {
        const result = await exportFile(nodes, edges, format);
        if (result.success) {
          await electronAPI.showMessage('Export Successful', 'Diagram exported as XML');
        } else {
          await electronAPI.showMessage('Export Failed', result.error || 'Unknown error', 'error');
        }
      }
    },
    [nodes, edges, exportImage, exportFile]
  );

  // Setup Electron menu listeners (only once on mount)
  const handlersRef = useRef({
    handleNew,
    handleOpen,
    handleSave,
    handleUndo,
    handleRedo,
    handleExport,
    handleAutoLayout,
    saveFileAs,
  });

  // Update refs when handlers change
  useEffect(() => {
    handlersRef.current = {
      handleNew,
      handleOpen,
      handleSave,
      handleUndo,
      handleRedo,
      handleExport,
      handleAutoLayout,
      saveFileAs,
    };
  }, [
    handleNew,
    handleOpen,
    handleSave,
    handleUndo,
    handleRedo,
    handleExport,
    handleAutoLayout,
    saveFileAs,
  ]);

  // Register listeners only once
  useEffect(() => {
    if (!electronAPI.isAvailable()) return;

    const cleanups = [
      electronAPI.onMenuNew(() => handlersRef.current.handleNew()),
      electronAPI.onMenuOpen(() => handlersRef.current.handleOpen()),
      electronAPI.onMenuSave(() => handlersRef.current.handleSave()),
      electronAPI.onMenuSaveAs(() => handlersRef.current.saveFileAs(nodes, edges)),
      electronAPI.onMenuUndo(() => handlersRef.current.handleUndo()),
      electronAPI.onMenuRedo(() => handlersRef.current.handleRedo()),
      electronAPI.onMenuExport((event, format) => handlersRef.current.handleExport(format)),
      electronAPI.onMenuAutoLayout(() => handlersRef.current.handleAutoLayout('TB')),
    ];

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []); // Empty dependency array - only runs once

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50">
      {/* Toolbar */}
      <Toolbar
        onNew={handleNew}
        onOpen={handleOpen}
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onAutoLayout={handleAutoLayout}
        onExport={handleExport}
        canUndo={canUndo}
        canRedo={canRedo}
        debugMode={debugModeState}
        onDebugModeToggle={handleDebugModeToggle}
        showMiniMap={showMiniMap}
        onMiniMapToggle={setShowMiniMap}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar onAddNode={handleAddNode} />

        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <div ref={reactFlowRef} className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              onPaneClick={onPaneClick}
              onNodeDragStop={onNodeDragStop}
              onInit={setReactFlowInstance}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              edgeUpdaterRadius={0}
              fitView
              snapToGrid
              snapGrid={[15, 15]}
              connectionMode="loose"
              connectionRadius={30}
              isValidConnection={isValidConnection}
              defaultEdgeOptions={{
                type: 'custom',
                animated: false,
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 20,
                  height: 20,
                },
              }}
            >
              <Background color="#aaa" gap={16} />
              <Controls />
              {showMiniMap && (
                <MiniMap
                  nodeColor={(node) => node.data.color}
                  className="!bg-white !border-gray-300"
                  zoomable
                  pannable
                />
              )}
            </ReactFlow>
          </div>
        </div>

        {/* Node Editor */}
        {selectedNode && (
          <NodeEditor
            node={selectedNode}
            onUpdate={handleUpdateNode}
            onDelete={handleDeleteNode}
            onClose={() => setSelectedNode(null)}
          />
        )}

        {/* Edge Editor */}
        {selectedEdge && (
          <EdgeEditor
            edge={selectedEdge}
            onUpdate={handleUpdateEdge}
            onReverse={handleReverseEdge}
            onDelete={handleDeleteEdge}
            onClose={() => setSelectedEdge(null)}
            onStartReconnection={handleStartReconnection}
            onCancelReconnection={handleCancelReconnection}
            reconnectMode={reconnectMode}
          />
        )}
      </div>
    </div>
  );
}

export default App;
