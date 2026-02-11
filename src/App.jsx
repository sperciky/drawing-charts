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
import { initialNodes, initialEdges } from './constants/initialData';
import { DEFAULT_NODE_COLOR } from './constants/colors';

const nodeTypes = {
  platform: PlatformNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

function App() {
  const reactFlowWrapper = useRef(null);
  const reactFlowRef = useRef(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Hooks
  const { pushState, undo, redo, canUndo, canRedo, reset } = useHistory({
    nodes: initialNodes,
    edges: initialEdges,
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

  // Save state to history on changes
  useEffect(() => {
    pushState({ nodes, edges });
  }, [nodes, edges]);

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  // Handle edge click
  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

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
        eds.map((e) =>
          e.id === edgeId
            ? {
                ...e,
                ...updatedEdge,
                data: { ...e.data, label: updatedEdge.label, type: updatedEdge.type },
              }
            : e
        )
      );
    },
    [setEdges]
  );

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

      // Undo/Redo - works even when typing
      if (event.ctrlKey || event.metaKey) {
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

    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNode(null);
    setSelectedEdge(null);
    reset({ nodes: initialNodes, edges: initialEdges });
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
              fitView
              snapToGrid
              snapGrid={[15, 15]}
              connectionMode="loose"
              isValidConnection={() => true}
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
              <MiniMap
                nodeColor={(node) => node.data.color}
                className="!bg-white !border-gray-300"
                zoomable
                pannable
              />
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
            onDelete={handleDeleteEdge}
            onClose={() => setSelectedEdge(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
