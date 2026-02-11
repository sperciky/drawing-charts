import { useCallback } from 'react';
import dagre from 'dagre';
import { getNodeDimensions } from '../utils/helpers';

export function useAutoLayout() {
  const applyAutoLayout = useCallback((nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 250;
    const nodeHeight = 150;

    dagreGraph.setGraph({
      rankdir: direction,
      nodesep: 100,
      ranksep: 150,
      marginx: 50,
      marginy: 50,
    });

    // Add nodes to dagre graph
    nodes.forEach((node) => {
      const dimensions = getNodeDimensions(node);
      dagreGraph.setNode(node.id, {
        width: dimensions.width,
        height: dimensions.height,
      });
    });

    // Add edges to dagre graph
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // Calculate layout
    dagre.layout(dagreGraph);

    // Apply new positions to nodes
    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      const dimensions = getNodeDimensions(node);

      return {
        ...node,
        position: {
          x: nodeWithPosition.x - dimensions.width / 2,
          y: nodeWithPosition.y - dimensions.height / 2,
        },
      };
    });

    return layoutedNodes;
  }, []);

  return {
    applyAutoLayout,
  };
}
